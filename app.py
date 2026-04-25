from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from prediction_model import PredictionModel
import pandas as pd
from random import randrange
from forms import OriginalTextForm


app = Flask(__name__)
app.config['SECRET_KEY'] = '4c99e0361905b9f941f17729187afdb9'
CORS(app, resources={r'/api/*': {'origins': ['http://localhost:4200']}})

data = pd.read_csv('random_dataset.csv')


@app.route('/', methods=['POST', 'GET'])
def home():
    form = OriginalTextForm()

    if form.generate.data:
        index = randrange(0, len(data) - 1, 1)
        original_text = data.loc[index].text
        form.original_text.data = str(original_text)
        return render_template('home.html', form=form, output=False)

    elif form.predict.data:
        if len(str(form.original_text.data)) > 10:
            model = PredictionModel(form.original_text.data)
            return render_template('home.html', form=form, output=model.predict())

    return render_template('home.html', form=form, output=False)


@app.route('/api/predict', methods=['POST'])
def api_predict():
    body = request.get_json(force=True)
    text = body.get('text', '')
    if len(text) < 10:
        return jsonify({'error': 'Text too short'}), 400
    model = PredictionModel(text)
    return jsonify(model.predict())


@app.route('/api/random', methods=['GET'])
def api_random():
    index = randrange(0, len(data) - 1, 1)
    return jsonify({
        'title': data.loc[index].title,
        'text': data.loc[index].text,
        'label': str(data.loc[index].label)
    })


# Legacy endpoint kept for backwards compatibility
@app.route('/predict/<original_text>', methods=['POST', 'GET'])
def predict(original_text):
    model = PredictionModel(original_text)
    return jsonify(model.predict())


@app.route('/random', methods=['GET'])
def random():
    index = randrange(0, len(data) - 1, 1)
    return jsonify({
        'title': data.loc[index].title,
        'text': data.loc[index].text,
        'label': str(data.loc[index].label)
    })


if __name__ == '__main__':
    app.run()
