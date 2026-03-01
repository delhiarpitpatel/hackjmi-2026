#!/bin/sh

echo "===============================" 
echo "welcome to local setup" 
echo "This sets up the local environment and installs the required libraries" 
echo "-------------------------------" 

if [ -d '.venv' ]
then 
    echo "virtual environment already exists" 
else 
    echo "no virtual environment found, creating one" 
    python3 -m venv .venv 
fi 

echo "Activating the virtual environment" 
. .venv/bin/activate

echo "installing the required libraries" 
pip install --upgrade pip 
pip install -r requirements.txt 

<<<<<<< HEAD
cp .env.example .env

=======
>>>>>>> 6b3cbae (Little changes)
echo "Setup Complete" 