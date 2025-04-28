from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pyttsx3
from RAG_retrieval_custom_stock_imgs import answer_with_rag

app = Flask(__name__)

CORS(app)

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Moves up from models/
audio_directory = os.path.join(base_dir, 'public', 'audio')  # This is the path to public/audio

# Existing endpoint
@app.route('/img', methods=['POST'])
def generate_images():
    data = request.get_json()
    prompts = data.get('prompts', [])
    
    if not isinstance(prompts, list):
        return jsonify({"error": "Invalid input. 'prompts' should be a list."}), 400

    results = []
    for prompt in prompts:
        try:
            answer, image_result = answer_with_rag(prompt)
            results.append({"prompt": prompt, "result": image_result})
        except Exception as e:
            results.append({"prompt": prompt, "error": str(e)})

    return jsonify(results)



# Ensure the audio folder exists
os.makedirs(audio_directory, exist_ok=True)

@app.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    try:
        # Full path to the requested file
        file_path = os.path.join(audio_directory, filename)
        
        # Check if the file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        # Serve the file from the audio directory
        return send_from_directory(audio_directory, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0)

@app.route('/generate-audio')
def generate_audio():
    text = request.args.get('text')
    index = request.args.get('index')

    if not text or index is None:
        return jsonify({"error": "Text and index are required"}), 400

    try:
        # Define the audio filename dynamically
        audio_filename = f"voiceover_{index}.mp3"
        audio_path = os.path.join(audio_directory, audio_filename)

        # Save audio to the file path
        engine.save_to_file(text, audio_path)
        engine.runAndWait()

        # Ensure the audio file is fully written
        import time
        timeout = 5  # seconds
        start_time = time.time()
        while (not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0) and (time.time() - start_time < timeout):
            time.sleep(0.1)  # wait a bit

        if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
            return jsonify({"error": "Audio generation failed"}), 500

        return jsonify({"message": "Audio saved", "file_path": f"/audio/{audio_filename}"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3005, debug=False)
