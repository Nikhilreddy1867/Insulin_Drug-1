# Project Starting Guide

This document covers only the essentials to set up and run the project.

## 1) Create and use one Python virtual environment (venv)

Run in the repository root:

- Create venv (Python 3.12 recommended)
  - `py -3.12 -m venv venv`
- Upgrade packaging tools
  - `./venv/Scripts/python.exe -m pip install -U pip setuptools wheel`

## 2) Install dependencies into venv

- Install backend requirements (CPU Torch by default)
  - `./venv/Scripts/python.exe -m pip install -r backend/requirements.txt`
- Install FastAPI service requirements (CPU Torch by default)
  - `./venv/Scripts/python.exe -m pip install -r python-api/requirements.txt`

- Optional: Upgrade to CUDA-enabled PyTorch (choose this if you have a compatible NVIDIA GPU)
  - CUDA 12.1 build:
    - `./venv/Scripts/python.exe -m pip install --upgrade --index-url https://download.pytorch.org/whl/cu121 torch torchvision torchaudio`

Notes:
- CPU Torch is included by default in both requirements files so new users can get started quickly.
- If you upgrade to CUDA Torch, do it after installing the requirements above.
- RDKit, Open Babel (openbabel-wheel), and Meeko are included in backend requirements for docking.
- Torch is installed separately with the CUDA 12.1 wheels (do not reinstall from requirements files).

## 3) Start the services (using venv)

- FastAPI (python-api):
  - `./venv/Scripts/python.exe ./python-api/api.py`
  - Default port: 8000

- Flask backend:
  - `./venv/Scripts/python.exe ./backend/combined_server.py`
  - Default port: 5001

- Frontend (from repo root):
  - `npm install`
  - `npm run dev`

## 4) Model files (not in repo)

Place required models folder in backend (do not commit):
- Backend models directory: `./backend/models/`
- Expected examples (filenames may differ in your setup):
  - `protein_classifier.pt`
  - `label_encoder.pkl`
  - `progen.pt`
  - `molt5_best.pt` (or similar)
  - `fusion_best.pt`

Ensure the paths in code point to `./backend/models`.

## 5) Environment variables (.env)

Create `./backend/.env` with only the required keys. Examples:

- Email/Mobile OTP (if used)
  - `EMAIL_ADDRESS=...`
  - `EMAIL_PASSWORD=...`
  - `TWILIO_ACCOUNT_SID=...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=...`

- MongoDB
  - `MONGO_URI=...`

- AlphaFold2 (Colab) integration
  - `ALPHAFOLD2_NGROK_URL="https://<your-ngrok-subdomain>.ngrok-free.app"`
  - Keep your AlphaFold2 notebook running in Colab and expose its API via ngrok.
  - Update this URL whenever ngrok changes.

Only include variables you actually use.

## 6) Quick verification

- GPU visible to PyTorch (if you upgraded to CUDA Torch)
  - `./venv/Scripts/python.exe -c "import torch; print(torch.cuda.is_available(), torch.version.cuda)"`
- RDKit/OpenBabel available
  - `./venv/Scripts/python.exe -c "from rdkit import Chem; from openbabel import openbabel as ob; print('OK')"`

## 7) File organization (diagram)

```text
Insulin_Drug_Synthesis/
├─ backend/
│  ├─ combined_server.py
│  ├─ local_docking.py
│  ├─ requirements.txt
│  ├─ models/                  # place model files here (not committed)
│  ├─ .env                     # env vars (see section 5)
│  └─ vina_1.2.7_win.exe       # Vina binary (used by docking)
├─ python-api/
│  ├─ api.py
│  └─ requirements.txt
├─ src/                        # frontend code (React/TS)
├─ misc/
│  └─ Drug Sheet.xlsx          # Excel used for SMILES→Drug mapping
├─ project_starting.md         # this guide
└─ package.json                # frontend scripts
```

That’s it. Follow the steps above in order.
