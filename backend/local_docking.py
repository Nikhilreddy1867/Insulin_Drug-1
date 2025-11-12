"""
Local Docking Implementation
Uses RDKit, OpenBabel, and AutoDock Vina - all CPU-based, no GPU needed
"""

import os
import tempfile
import subprocess
import logging

logger = logging.getLogger(__name__)

def parse_pdbqt_affinities(pdbqt_file: str) -> list:
    """Parse affinity scores from PDBQT file"""
    affinities = []
    try:
        with open(pdbqt_file, 'r') as f:
            for line in f:
                if line.startswith("REMARK VINA RESULT"):
                    parts = line.split()
                    if len(parts) > 3:
                        try:
                            affinity = float(parts[3])
                            affinities.append(affinity)
                        except ValueError:
                            continue
        return affinities
    except Exception as e:
        logger.error(f"Error parsing {pdbqt_file}: {e}")
        return []


def run_local_docking(smiles: str, protein_pdb: str) -> dict:
    """
    Run molecular docking locally using RDKit, OpenBabel, and AutoDock Vina
    
    Args:
        smiles: SMILES string of the drug molecule
        protein_pdb: PDB file content (rank 1 from AlphaFold2)
    
    Returns:
        dict with 'affinities', 'best_affinity', 'docked_poses', 'pdbqt_content'
    """
    try:
        from rdkit import Chem
        from rdkit.Chem import AllChem, rdmolfiles
    except ImportError as e:
        logger.error(f"Missing RDKit: {e}")
        logger.error("Install with: pip install rdkit")
        raise ImportError("RDKit not installed. Install with: pip install rdkit")
    
    # Note: We use Vina binary directly via subprocess instead of Python package
    # Install with: brew install vina (Mac) or download from vina.scripps.edu
    
    # Create temporary directory for files
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        try:
            # 1. Generate ligand 3D structure from SMILES
            logger.info(f"[Docking] Generating 3D structure for ligand from SMILES: {smiles[:50]}...")
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                logger.error(f"[Docking] Failed to parse SMILES: {smiles}")
                raise ValueError(f"Failed to parse SMILES string: {smiles}")
            
            logger.info(f"[Docking] SMILES parsed successfully, adding hydrogens...")
            mol = Chem.AddHs(mol)
            
            try:
                logger.info("[Docking] Embedding molecule with ETKDG...")
                embed_result = AllChem.EmbedMolecule(mol, AllChem.ETKDG())
                if embed_result == -1:
                    logger.warning("[Docking] ETKDG embedding failed, trying random embedding...")
                    AllChem.EmbedMolecule(mol, AllChem.ETKDG(useRandomCoords=True))
                
                logger.info("[Docking] Optimizing molecule geometry...")
                AllChem.UFFOptimizeMolecule(mol, maxIters=200)
            except Exception as e:
                logger.warning(f"[Docking] Warning in embedding/optimization: {e}, continuing with current structure...")
            
            ligand_pdb = os.path.join(tmpdir, 'ligand.pdb')
            rdmolfiles.MolToPDBFile(mol, ligand_pdb)
            
            # Verify PDB was created
            if not os.path.exists(ligand_pdb):
                raise FileNotFoundError("Failed to create ligand PDB file")
            
            pdb_size = os.path.getsize(ligand_pdb)
            logger.info(f"[Docking] ✅ 3D structure saved as 'ligand.pdb' ({pdb_size} bytes)")
            
            if pdb_size < 100:
                logger.warning("[Docking] Ligand PDB file is very small, might be problematic")
            
            # Convert ligand PDB to PDBQT using Python OpenBabel
            logger.info("[Docking] Converting ligand PDB to PDBQT...")
            ligand_pdbqt = os.path.join(tmpdir, 'ligand.pdbqt')
            
            try:
                from openbabel import openbabel as ob
                logger.info("[Docking] Using Python OpenBabel library")
                
                # Create OpenBabel conversion
                obConversion = ob.OBConversion()
                obConversion.SetInAndOutFormats("pdb", "pdbqt")
                obConversion.AddOption("h", ob.OBConversion.OUTOPTIONS)  # Add hydrogens
                
                mol = ob.OBMol()
                obConversion.ReadFile(mol, ligand_pdb)
                obConversion.WriteFile(mol, ligand_pdbqt)
                
                if not os.path.exists(ligand_pdbqt):
                    raise RuntimeError("OpenBabel failed to create PDBQT file")
                
                # Verify output file has content
                with open(ligand_pdbqt, 'r') as f:
                    pdbqt_content = f.read()
                    if len(pdbqt_content.strip()) < 10:
                        raise RuntimeError("Generated PDBQT file is empty or invalid")
                
                logger.info("[Docking] ✅ Converted ligand to PDBQT using Python OpenBabel")
                
            except ImportError:
                logger.warning("[Docking] Python OpenBabel not available, trying executable...")
                # Fallback to executable-based approach
                script_dir = os.path.dirname(os.path.abspath(__file__))
                local_obabel = os.path.join(script_dir, "obabel.exe")
                obabel_paths = [local_obabel, "obabel", "/opt/homebrew/bin/obabel", "/usr/local/bin/obabel", "/usr/bin/obabel"]
                obabel_cmd = None
                
                for path in obabel_paths:
                    if os.path.isfile(path):
                        obabel_cmd = path
                        logger.info(f"[Docking] Found OpenBabel at: {path}")
                        break
                
                if obabel_cmd is None:
                    raise RuntimeError("OpenBabel not found. Install with: pip install openbabel-wheel")
                
                result = subprocess.run(
                    [obabel_cmd, ligand_pdb, "-O", ligand_pdbqt, "-xh"],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode != 0:
                    raise RuntimeError(f"OpenBabel conversion failed: {result.stderr[:200]}")
                
                logger.info("[Docking] ✅ Converted ligand to PDBQT using executable")
            
            # 2. Save protein PDB (rank 1 from AlphaFold2)
            logger.info("[Docking] Processing protein PDB (rank 1 from AlphaFold2)...")
            protein_pdb_file = os.path.join(tmpdir, 'protein.pdb')
            with open(protein_pdb_file, 'w') as f:
                f.write(protein_pdb)
            
            # Convert protein to PDBQT using Python OpenBabel
            logger.info("[Docking] Converting protein to PDBQT...")
            protein_pdbqt = os.path.join(tmpdir, 'protein.pdbqt')
            
            try:
                from openbabel import openbabel as ob
                
                # Create OpenBabel conversion for protein
                obConversion = ob.OBConversion()
                obConversion.SetInAndOutFormats("pdb", "pdbqt")
                obConversion.AddOption("r", ob.OBConversion.OUTOPTIONS)  # Rigid receptor
                
                mol = ob.OBMol()
                obConversion.ReadFile(mol, protein_pdb_file)
                obConversion.WriteFile(mol, protein_pdbqt)
                
                if not os.path.exists(protein_pdbqt):
                    raise RuntimeError("OpenBabel failed to create protein PDBQT file")
                
                # Verify output file has content
                with open(protein_pdbqt, 'r') as f:
                    pdbqt_content = f.read()
                    if len(pdbqt_content.strip()) < 10:
                        raise RuntimeError("Generated protein PDBQT file is empty or invalid")
                
                logger.info("[Docking] ✅ Converted protein to PDBQT using Python OpenBabel")
                
            except Exception as e:
                logger.error(f"[Docking] Protein conversion failed: {e}")
                raise RuntimeError(f"Protein conversion failed: {str(e)}")
            
            # 3. Run Vina docking using binary (more reliable than Python package)
            logger.info("[Docking] Running AutoDock Vina...")
            
            # Find vina binary (check local folder first, then PATH, then common locations)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            local_vina = os.path.join(script_dir, "vina.exe")
            local_vina_alt = os.path.join(script_dir, "vina_1.2.7_win.exe")
            vina_cmd = None
            
            # Check common paths including local folder
            vina_paths = [local_vina, local_vina_alt, "vina", "/opt/homebrew/bin/vina", "/usr/local/bin/vina", "/usr/bin/vina"]
            for path in vina_paths:
                try:
                    # For local paths, check file existence first
                    if os.path.isfile(path):
                        vina_cmd = path
                        logger.info(f"[Docking] Found Vina at: {path}")
                        break
                    
                    # For system paths, try running with version check
                    result = subprocess.run(
                        [path, "--version"],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        vina_cmd = path
                        logger.info(f"[Docking] Found Vina at: {path}")
                        break
                except (FileNotFoundError, subprocess.TimeoutExpired):
                    continue
                except Exception as e:
                    logger.debug(f"[Docking] Error checking {path}: {e}")
                    continue
            
            if vina_cmd is None:
                raise RuntimeError("AutoDock Vina binary not found. Install with: brew install vina (Mac) or download from http://vina.scripps.edu/download.html")
            
            # Create config file for Vina
            config_file = os.path.join(tmpdir, 'vina_config.txt')
            with open(config_file, 'w') as f:
                f.write(f"receptor = {protein_pdbqt}\n")
                f.write(f"ligand = {ligand_pdbqt}\n")
                f.write(f"out = {os.path.join(tmpdir, 'docked_out.pdbqt')}\n")
                f.write("center_x = 0\n")
                f.write("center_y = 0\n")
                f.write("center_z = 0\n")
                f.write("size_x = 25\n")
                f.write("size_y = 25\n")
                f.write("size_z = 25\n")
                f.write("exhaustiveness = 8\n")
                f.write("num_modes = 5\n")
            
            # Run Vina
            docked_pdbqt = os.path.join(tmpdir, 'docked_out.pdbqt')
            logger.info("[Docking] Performing docking (this may take 1-3 minutes)...")
            result = subprocess.run(
                [vina_cmd, "--config", config_file],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode != 0:
                logger.error(f"[Docking] Vina error: {result.stderr}")
                raise RuntimeError(f"Vina docking failed: {result.stderr}")
            
            if not os.path.exists(docked_pdbqt):
                raise FileNotFoundError("Docking output file not generated")
            
            logger.info("[Docking] ✅ Docking completed")
            
            # Parse affinities from output file
            logger.info("[Docking] Retrieving affinity scores...")
            affinities = parse_pdbqt_affinities(docked_pdbqt)
            
            if not affinities:
                # Try parsing from Vina stdout
                for line in result.stdout.split('\n'):
                    if 'affinity' in line.lower() or 'kcal/mol' in line.lower():
                        # Try to extract affinity values
                        import re
                        matches = re.findall(r'-?\d+\.\d+', line)
                        if matches:
                            affinities.append(float(matches[0]))
                
                if not affinities:
                    raise RuntimeError("Could not extract affinity scores from docking results")
            
            if not affinities:
                raise RuntimeError("No affinity scores found in docking results")
            
            # Read PDBQT content
            with open(docked_pdbqt, 'r') as f:
                pdbqt_content = f.read()
            
            # Store protein PDB and docked PDBQT content for 3D visualization
            # The frontend will use 3Dmol.js to render interactive 3D visualization
            # (similar to py3Dmol in Colab)
            
            logger.info(f"[Docking] ✅ Docking completed! Best affinity: {min(affinities):.2f} kcal/mol")
            
            result = {
                'affinities': affinities,
                'best_affinity': min(affinities),
                'docked_poses': len(affinities),
                'pdbqt_content': pdbqt_content,
                'protein_pdb': protein_pdb,  # Include protein PDB for 3D visualization
                'visualization_data': {
                    'protein_pdb': protein_pdb,
                    'ligand_pdbqt': pdbqt_content
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"[Docking] Error during docking: {e}", exc_info=True)
            raise

