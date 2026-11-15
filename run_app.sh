#!/bin/bash
echo "Iniciando Traductor SRT Web..."
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual e instalando dependencias..."
    python3 -m venv venv
    source venv/bin/activate
    pip install flask srt deep-translator
else
    source venv/bin/activate
fi
echo "Abriendo el navegador..."
sleep 2 && open http://127.0.0.1:5000 &
python3 app.py
