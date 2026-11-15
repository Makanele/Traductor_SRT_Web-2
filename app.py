from flask import Flask, request, jsonify, render_template, send_file
import srt
from deep_translator import GoogleTranslator
import os
from io import BytesIO

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if not file.filename.endswith('.srt'):
        return jsonify({'error': 'El archivo debe tener formato .srt'}), 400
        
    try:
        content = file.read().decode('utf-8')
        subs = list(srt.parse(content))
        traductor = GoogleTranslator(source='auto', target='es')
        
        for sub in subs:
            if sub.content.strip():
                sub.content = traductor.translate(sub.content)
                
        translated_content = srt.compose(subs)
        
        # Guardar en buffer de memoria para enviarlo directo sin guardar en disco
        output_stream = BytesIO()
        output_stream.write(translated_content.encode('utf-8'))
        output_stream.seek(0)
        
        filename, _ = os.path.splitext(file.filename)
        out_filename = f"{filename}_es.srt"
        
        return send_file(
            output_stream,
            as_attachment=True,
            download_name=out_filename,
            mimetype='text/plain'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
