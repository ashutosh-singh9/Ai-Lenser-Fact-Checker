"""
AI LENSER - Backend API Server
Flask-based REST API for fake news detection
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
from datetime import datetime
import json

from model import analyze_text

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# In-memory storage for history (in production, use a database)
analysis_history = []
stats = {"verified": 0, "fake": 0}

# Sample trending news data (in production, fetch from news API)
TRENDING_NEWS = [
    {
        "id": 1,
        "title": "Government launches new digital literacy program across rural India",
        "source": "PIB India",
        "status": "verified",
        "timestamp": "2 hours ago"
    },
    {
        "id": 2,
        "title": "WhatsApp forward claiming free government laptops is FALSE",
        "source": "AltNews",
        "status": "fake",
        "timestamp": "3 hours ago"
    },
    {
        "id": 3,
        "title": "RBI announces new UPI transaction limits for enhanced security",
        "source": "Economic Times",
        "status": "verified",
        "timestamp": "5 hours ago"
    },
    {
        "id": 4,
        "title": "Viral claim about 5G towers causing health issues debunked",
        "source": "BoomLive",
        "status": "fake",
        "timestamp": "6 hours ago"
    },
    {
        "id": 5,
        "title": "ISRO confirms successful satellite launch for communication",
        "source": "ISRO Official",
        "status": "verified",
        "timestamp": "8 hours ago"
    },
    {
        "id": 6,
        "title": "Fake: Image claiming to show Minister's resignation letter",
        "source": "FactChecker.in",
        "status": "fake",
        "timestamp": "10 hours ago"
    }
]


@app.route('/')
def serve_frontend():
    """Serve the frontend"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/analyze-text', methods=['POST'])
def api_analyze_text():
    """Analyze text for fake news detection"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Analyze the text
        result = analyze_text(text)
        
        # Update stats
        global stats
        if result['prediction'] == 'FAKE':
            stats['fake'] += 1
        else:
            stats['verified'] += 1
        
        # Add to history
        history_item = {
            "id": len(analysis_history) + 1,
            "text": text[:100] + "..." if len(text) > 100 else text,
            "result": result,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "type": "text"
        }
        analysis_history.insert(0, history_item)
        
        # Keep only last 50 items
        if len(analysis_history) > 50:
            analysis_history.pop()
        
        return jsonify({
            "success": True,
            "result": result,
            "stats": stats
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/analyze-image', methods=['POST'])
def api_analyze_image():
    """Analyze image for text extraction and fake news detection"""
    try:
        data = request.get_json()
        image_data = data.get('image', '')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        # For demo purposes, we'll simulate OCR
        # In production, use pytesseract for actual OCR
        # extracted_text = perform_ocr(image_data)
        
        # Simulate extracted text for demo
        extracted_text = data.get('extracted_text', 'Sample extracted text from image for demonstration')
        
        # Analyze the extracted text
        result = analyze_text(extracted_text)
        
        # Update stats
        global stats
        if result['prediction'] == 'FAKE':
            stats['fake'] += 1
        else:
            stats['verified'] += 1
        
        # Add to history
        history_item = {
            "id": len(analysis_history) + 1,
            "text": "[Image] " + extracted_text[:80] + "...",
            "result": result,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "type": "image"
        }
        analysis_history.insert(0, history_item)
        
        return jsonify({
            "success": True,
            "result": result,
            "extracted_text": extracted_text,
            "stats": stats
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/trending-news', methods=['GET'])
def api_trending_news():
    """Get trending fact-checked news"""
    return jsonify({
        "success": True,
        "news": TRENDING_NEWS
    })


@app.route('/api/history', methods=['GET'])
def api_get_history():
    """Get analysis history"""
    return jsonify({
        "success": True,
        "history": analysis_history,
        "stats": stats
    })


@app.route('/api/history', methods=['DELETE'])
def api_clear_history():
    """Clear analysis history"""
    global analysis_history, stats
    analysis_history = []
    stats = {"verified": 0, "fake": 0}
    return jsonify({
        "success": True,
        "message": "History cleared"
    })


@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    """Get current stats"""
    return jsonify({
        "success": True,
        "stats": stats
    })


if __name__ == '__main__':
    print("=" * 50)
    print("🔍 AI LENSER - Fake News Detection API")
    print("=" * 50)
    print("Server running at: http://localhost:5000")
    print("API Endpoints:")
    print("  POST /api/analyze-text - Analyze text")
    print("  POST /api/analyze-image - Analyze image")
    print("  GET  /api/trending-news - Get trending news")
    print("  GET  /api/history - Get analysis history")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
