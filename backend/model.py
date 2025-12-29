"""
AI LENSER - Fake News Detection Model
Uses TF-IDF + Logistic Regression for classification
"""

import re
import string
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np

class FakeNewsDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.is_trained = False
        self._train_on_sample_data()
    
    def _preprocess_text(self, text):
        """Clean and preprocess text"""
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', '', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def _train_on_sample_data(self):
        """Train on sample fake and real news data for demo purposes"""
        # Sample training data - mix of patterns from real fake news datasets
        fake_news_samples = [
            "BREAKING: Scientists discover that drinking bleach cures all diseases",
            "Government secretly implanting chips in COVID vaccines",
            "PM announces Rs 15 lakh transfer to every citizen bank account immediately",
            "WhatsApp forward: Eating garlic kills coronavirus instantly proven by WHO",
            "SHOCKING: 5G towers causing cancer and COVID spread confirmed",
            "NASA confirms end of world next week asteroid impact certain",
            "Viral: Drinking cow urine cures diabetes and cancer says expert",
            "Breaking news government hiding alien contact since 1950",
            "Forward this message to 10 people or face bad luck for 7 years",
            "Exposed: All vaccines cause autism new study reveals truth",
            "URGENT: Bank accounts will be frozen if Aadhaar not linked",
            "Scientists confirm earth is flat NASA admits to lying for decades",
            "Miracle cure discovered drink hot water with lemon kills all viruses",
            "Secret society controls world governments illuminati exposed",
            "Child kidnappers in white van spotted in your area share immediately",
            "Famous celebrity died breaking news shocking death confirmed",
            "Government planning to ban all cash transactions next month",
            "Eating papaya seeds cures dengue fever instantly ayurvedic remedy",
            "Solar eclipse causes birth defects pregnant women must stay inside",
            "RBI announces all old notes invalid exchange immediately or lose money",
            "Drinking warm water cures COVID-19 WHO doctor confirms",
            "Forwarded: Blood donation causes weakness and disease spread",
            "Muslim population will overtake Hindu by 2030 census report",
            "China spreading virus intentionally biological warfare confirmed",
            "Onion in socks cures fever and cold overnight proven remedy",
            "Government giving free laptops to all students register now link",
            "Pepsi contains pig fat laboratory test confirms avoid drinking",
            "Full moon affects human behavior causes violence and madness",
            "Mobile phones cause brain tumors WHO bans cell phone usage",
            "Plastic rice from China being sold in Indian markets danger alert",
        ]
        
        real_news_samples = [
            "Supreme Court upholds constitutional validity of Aadhaar with certain conditions",
            "RBI maintains repo rate unchanged in monetary policy review meeting",
            "India successfully launches Chandrayaan-3 mission to moon south pole",
            "Government announces new education policy focusing on skill development",
            "Stock market closes at record high amid positive economic indicators",
            "Weather department issues orange alert for heavy rainfall in coastal areas",
            "Parliament passes amendment bill after debate in both houses",
            "Election Commission announces schedule for upcoming state elections",
            "Scientists publish peer-reviewed study on climate change impact",
            "Central government approves new metro rail project for city expansion",
            "Health ministry releases guidelines for COVID-19 vaccination drive",
            "ISRO announces successful test of new rocket engine technology",
            "Finance minister presents union budget with focus on infrastructure",
            "Supreme Court delivers landmark judgment on privacy rights",
            "Census data reveals population growth rate decline in recent decade",
            "Indian economy shows signs of recovery GDP growth at 7 percent",
            "New IT rules require social media platforms to address grievances",
            "Government launches digital health mission for universal coverage",
            "Research team develops new treatment showing promise in clinical trials",
            "Air quality index improves following implementation of pollution control",
            "Central bank introduces new digital payment system for faster transactions",
            "Parliament session begins with address by president on national priorities",
            "Scientists discover high temperature superconductivity breakthrough material",
            "Election results announced ruling party wins majority in state polls",
            "Government signs bilateral trade agreement with neighboring country",
            "New highway project inaugurated connecting major cities reduces travel",
            "University publishes new research on renewable energy solutions",
            "Sports ministry announces national program for athlete development",
            "Technology startup raises funding to expand operations in new markets",
            "Healthcare infrastructure improvement plan approved by cabinet decision",
        ]
        
        # Create training data
        texts = fake_news_samples + real_news_samples
        labels = [0] * len(fake_news_samples) + [1] * len(real_news_samples)  # 0=fake, 1=real
        
        # Preprocess
        processed_texts = [self._preprocess_text(t) for t in texts]
        
        # Fit vectorizer and model
        X = self.vectorizer.fit_transform(processed_texts)
        self.model.fit(X, labels)
        self.is_trained = True
    
    def predict(self, text):
        """
        Predict if news is fake or real
        Returns: dict with prediction, confidence, and trust_score (0-100)
        """
        if not text or len(text.strip()) < 10:
            return {
                "prediction": "insufficient_text",
                "confidence": 0,
                "trust_score": 50,
                "label": "Need more text to analyze",
                "details": "Please provide a longer text for accurate analysis"
            }
        
        processed = self._preprocess_text(text)
        X = self.vectorizer.transform([processed])
        
        # Get prediction and probability
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Get confidence for predicted class
        confidence = probabilities[prediction]
        
        # Calculate trust score (0-100)
        # If real (1), trust_score = probability * 100
        # If fake (0), trust_score = (1 - probability_of_fake) * 100, but capped low
        if prediction == 1:  # Real news
            trust_score = int(probabilities[1] * 100)
            label = "Likely Authentic"
            verdict = "REAL"
        else:  # Fake news
            trust_score = int(probabilities[1] * 100)  # Use real probability as trust
            label = "Likely Fake"
            verdict = "FAKE"
        
        # Add some analysis details
        details = self._generate_analysis_details(text, prediction, trust_score)
        
        return {
            "prediction": verdict,
            "confidence": round(confidence * 100, 1),
            "trust_score": trust_score,
            "label": label,
            "details": details,
            "probabilities": {
                "fake": round(probabilities[0] * 100, 1),
                "real": round(probabilities[1] * 100, 1)
            }
        }
    
    def _generate_analysis_details(self, text, prediction, trust_score):
        """Generate human-readable analysis details"""
        text_lower = text.lower()
        flags = []
        
        # Check for common fake news indicators
        if any(word in text_lower for word in ['breaking', 'urgent', 'shocking', 'exposed']):
            flags.append("Contains sensationalist language")
        
        if any(word in text_lower for word in ['forward', 'share', 'viral', 'whatsapp']):
            flags.append("Social media forward patterns detected")
        
        if any(word in text_lower for word in ['cure', 'miracle', 'instant', 'proven']):
            flags.append("Unverified medical claims detected")
        
        if '!' in text and text.count('!') > 2:
            flags.append("Excessive exclamation marks")
        
        if text.upper() == text and len(text) > 20:
            flags.append("All caps text (often indicates unreliable source)")
        
        if prediction == 0:  # Fake
            if not flags:
                flags.append("Text patterns match common misinformation")
            return "⚠️ Caution advised. " + "; ".join(flags)
        else:  # Real
            if trust_score > 80:
                return "✓ Text appears to follow credible news patterns"
            else:
                return "◐ Some credibility indicators present, but verification recommended"


# Singleton instance
detector = FakeNewsDetector()

def analyze_text(text):
    """Main function to analyze text"""
    return detector.predict(text)


if __name__ == "__main__":
    # Test the model
    test_cases = [
        "BREAKING: Drinking hot water with lemon cures COVID instantly share now",
        "Government announces new economic policy to boost manufacturing sector",
        "Forward this to 10 people or bad luck will follow you for 7 years",
        "RBI maintains interest rates unchanged in quarterly monetary policy review",
    ]
    
    print("=" * 60)
    print("AI LENSER - Fake News Detection Test")
    print("=" * 60)
    
    for text in test_cases:
        result = analyze_text(text)
        print(f"\nText: {text[:60]}...")
        print(f"Verdict: {result['prediction']} ({result['trust_score']}% trust)")
        print(f"Details: {result['details']}")
        print("-" * 40)
