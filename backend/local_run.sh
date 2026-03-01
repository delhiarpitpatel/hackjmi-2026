#!/bin/sh

echo "====================================" 
echo "Running your application locally" 
echo "-----------------------------------" 

if [ -d '.venv' ]
then 
    echo "local environment found" 
else 
    echo "no local environment found, please run local_setup.sh first" 
    exit 1
fi 

echo "Activating the local environment" 
. .venv/bin/activate 


echo "running your application" 
<<<<<<< HEAD
uvicorn main:app --reload --host 0.0.0.0 --port 8000
=======
uvicorn main:app --reload --host 0.0.0.0 --port 8000
>>>>>>> 6b3cbae (Little changes)
