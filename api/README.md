# API

*NB: used Ubuntu 20.04, Python 3.8.10, and 20.0.2*


### Setup
```bash
virtualenv venv && source venv/bin/activate
pip install -r requirements.txt
```

### Run
```bash
uvicorn main:app --reload
```