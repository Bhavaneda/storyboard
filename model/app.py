from flask import Flask, request, jsonify
from flask_cors import CORS
from RAG_retrieval_custom_stock_imgs import answer_with_rag

app = Flask(__name__)
CORS(app)

@app.route('/img', methods=['POST'])
def generate_images():
    print(request)
    data = request.get_json()
    print(data)
    prompts = data.get('prompts', [])
    print(prompts)
    
    if not isinstance(prompts, list):
        return jsonify({"error": "Invalid input. 'prompts' should be a list."}), 400

    results = []
    for prompt in prompts:
        try:
            answer, image_result = answer_with_rag(prompt)
            print(answer)
            results.append({"prompt": prompt, "result": image_result})
        except Exception as e:
            results.append({"prompt": prompt, "error": str(e)})
    print(results)

    return jsonify(results)

if __name__ == '__main__':
    app.run(port=3005, debug=True)