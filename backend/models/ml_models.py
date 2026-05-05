"""
Machine Learning Models for UPSC Performance Prediction
Handles model training, prediction, and evaluation
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

class UPSCPerformancePredictor:
    """
    Machine Learning model for predicting UPSC Prelims qualification
    """
    
    def __init__(self):
        """Initialize the predictor with multiple models"""
        self.models = {
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Decision Tree': DecisionTreeClassifier(random_state=42),
            'Random Forest': RandomForestClassifier(random_state=42, n_jobs=-1),
            'Gradient Boosting': GradientBoostingClassifier(random_state=42),
            'SVM': SVC(random_state=42, probability=True)
        }
        
        self.results = {}
        self.best_model = None
        self.best_model_name = None
        self.best_score = 0
        self.scaler = None
        
    def prepare_data(self, df, target_col='target'):
        """
        Prepare data for training
        
        Args:
            df: DataFrame with features and target
            target_col: Name of target column
            
        Returns:
            X_train, X_test, y_train, y_test, feature_names
        """
        # Separate features and target
        if target_col in df.columns:
            y = df[target_col]
            X = df.drop(columns=[target_col, 'student_id'], errors='ignore')
        else:
            raise ValueError(f"Target column '{target_col}' not found")
        
        # Remove non-numeric columns
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        X = X[numeric_cols]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        return X_train, X_test, y_train, y_test, X.columns.tolist()
    
    def train_models(self, X_train, y_train, X_test, y_test):
        """
        Train all models and compare performance
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_test: Testing features
            y_test: Testing labels
            
        Returns:
            Dictionary of results
        """
        print("="*60)
        print("Training ML Models for UPSC Performance Prediction")
        print("="*60)
        
        for name, model in self.models.items():
            print(f"\n📊 Training {name}...")
            
            try:
                # Train model
                model.fit(X_train, y_train)
                
                # Make predictions
                y_pred = model.predict(X_test)
                
                # Calculate metrics
                accuracy = accuracy_score(y_test, y_pred)
                precision = precision_score(y_test, y_pred)
                recall = recall_score(y_test, y_pred)
                f1 = f1_score(y_test, y_pred)
                
                # Store results
                self.results[name] = {
                    'model': model,
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1
                }
                
                print(f"   ✅ Accuracy: {accuracy:.4f}")
                print(f"   ✅ Precision: {precision:.4f}")
                print(f"   ✅ Recall: {recall:.4f}")
                print(f"   ✅ F1-Score: {f1:.4f}")
                
                # Track best model
                if f1 > self.best_score:
                    self.best_score = f1
                    self.best_model = model
                    self.best_model_name = name
                    
            except Exception as e:
                print(f"   ❌ Error training {name}: {str(e)}")
        
        print("\n" + "="*60)
        print(f"🏆 Best Model: {self.best_model_name} with F1-Score: {self.best_score:.4f}")
        print("="*60)
        
        return self.results
    
    def hyperparameter_tuning(self, X_train, y_train):
        """
        Perform hyperparameter tuning for Random Forest and Gradient Boosting
        
        Args:
            X_train: Training features
            y_train: Training labels
            
        Returns:
            Best tuned model
        """
        print("\n🔧 Performing Hyperparameter Tuning...")
        
        # Random Forest tuning
        rf_params = {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        rf_grid = GridSearchCV(
            RandomForestClassifier(random_state=42),
            rf_params,
            cv=5,
            scoring='f1',
            n_jobs=-1
        )
        
        print("   Tuning Random Forest...")
        rf_grid.fit(X_train, y_train)
        
        # Gradient Boosting tuning
        gb_params = {
            'n_estimators': [50, 100, 200],
            'learning_rate': [0.05, 0.1, 0.2],
            'max_depth': [3, 5, 7],
            'min_samples_split': [2, 5]
        }
        
        gb_grid = GridSearchCV(
            GradientBoostingClassifier(random_state=42),
            gb_params,
            cv=5,
            scoring='f1',
            n_jobs=-1
        )
        
        print("   Tuning Gradient Boosting...")
        gb_grid.fit(X_train, y_train)
        
        # Compare tuned models
        rf_score = rf_grid.best_score_
        gb_score = gb_grid.best_score_
        
        print(f"\n   Random Forest Best Score: {rf_score:.4f}")
        print(f"   Gradient Boosting Best Score: {gb_score:.4f}")
        
        if rf_score > gb_score:
            best_tuned = rf_grid.best_estimator_
            print(f"\n✅ Best Tuned Model: Random Forest with params: {rf_grid.best_params_}")
        else:
            best_tuned = gb_grid.best_estimator_
            print(f"\n✅ Best Tuned Model: Gradient Boosting with params: {gb_grid.best_params_}")
        
        return best_tuned
    
    def cross_validate(self, X, y, cv=5):
        """
        Perform cross-validation on best model
        
        Args:
            X: Features
            y: Labels
            cv: Number of folds
            
        Returns:
            Cross-validation scores
        """
        if self.best_model is None:
            raise ValueError("No model trained yet. Call train_models() first.")
        
        print(f"\n📊 Performing {cv}-Fold Cross-Validation...")
        
        cv_scores = cross_val_score(self.best_model, X, y, cv=cv, scoring='f1')
        
        print(f"   Fold scores: {[round(s, 4) for s in cv_scores]}")
        print(f"   Mean F1-Score: {cv_scores.mean():.4f}")
        print(f"   Standard Deviation: {cv_scores.std():.4f}")
        
        return cv_scores
    
    def predict(self, student_data):
        """
        Predict qualification for a single student
        
        Args:
            student_data: DataFrame or array of features
            
        Returns:
            prediction (0 or 1), probability (if available)
        """
        if self.best_model is None:
            raise ValueError("No model loaded. Load a trained model first.")
        
        prediction = self.best_model.predict(student_data)[0]
        
        if hasattr(self.best_model, 'predict_proba'):
            probability = self.best_model.predict_proba(student_data)[0][1]
        else:
            probability = None
        
        return prediction, probability
    
    def predict_batch(self, students_data):
        """
        Predict qualification for multiple students
        
        Args:
            students_data: DataFrame of features
            
        Returns:
            List of predictions and probabilities
        """
        if self.best_model is None:
            raise ValueError("No model loaded. Load a trained model first.")
        
        predictions = self.best_model.predict(students_data)
        
        if hasattr(self.best_model, 'predict_proba'):
            probabilities = self.best_model.predict_proba(students_data)[:, 1]
        else:
            probabilities = None
        
        return predictions.tolist(), probabilities.tolist() if probabilities is not None else None
    
    def get_feature_importance(self, feature_names):
        """
        Get feature importance from tree-based models
        
        Args:
            feature_names: List of feature names
            
        Returns:
            DataFrame with feature importances
        """
        if self.best_model is None:
            raise ValueError("No model trained yet.")
        
        if hasattr(self.best_model, 'feature_importances_'):
            importances = self.best_model.feature_importances_
            
            importance_df = pd.DataFrame({
                'feature': feature_names[:len(importances)],
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            return importance_df
        else:
            print(f"{self.best_model_name} does not provide feature importance")
            return None
    
    def save_model(self, filepath='ml_models/saved_models/best_upsc_model.pkl'):
        """
        Save the best model to disk
        
        Args:
            filepath: Path to save the model
        """
        if self.best_model is None:
            raise ValueError("No model to save. Train a model first.")
        
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        joblib.dump(self.best_model, filepath)
        print(f"✅ Model saved to {filepath}")
        
        # Also save metadata
        metadata = {
            'model_name': self.best_model_name,
            'f1_score': self.best_score,
            'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        metadata_path = filepath.replace('.pkl', '_metadata.pkl')
        joblib.dump(metadata, metadata_path)
        print(f"✅ Metadata saved to {metadata_path}")
    
    def load_model(self, filepath='ml_models/saved_models/best_upsc_model.pkl'):
        """
        Load a saved model from disk
        
        Args:
            filepath: Path to the saved model
        """
        try:
            self.best_model = joblib.load(filepath)
            print(f"✅ Model loaded from {filepath}")
            
            # Load metadata if exists
            metadata_path = filepath.replace('.pkl', '_metadata.pkl')
            try:
                metadata = joblib.load(metadata_path)
                self.best_model_name = metadata.get('model_name', 'Unknown')
                self.best_score = metadata.get('f1_score', 0)
                print(f"   Model: {self.best_model_name}, F1-Score: {self.best_score:.4f}")
            except:
                pass
                
            return True
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False
    
    def get_model_performance_summary(self):
        """
        Get summary of all model performances
        
        Returns:
            DataFrame with performance metrics
        """
        if not self.results:
            return None
        
        summary_df = pd.DataFrame({
            name: {
                'Accuracy': metrics['accuracy'],
                'Precision': metrics['precision'],
                'Recall': metrics['recall'],
                'F1-Score': metrics['f1_score']
            }
            for name, metrics in self.results.items()
        }).T
        
        return summary_df


# Example usage
if __name__ == "__main__":
    # Sample usage
    predictor = UPSCPerformancePredictor()
    
    # Load your data
    # df = pd.read_csv('upsc_prelims_processed.csv')
    # X_train, X_test, y_train, y_test, features = predictor.prepare_data(df)
    # predictor.train_models(X_train, y_train, X_test, y_test)
    # predictor.save_model()
    
    print("UPSCPerformancePredictor class is ready to use!")