"""
Notification Service for UPSC Learning System
Handles email notifications, push notifications, and reminders
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

class NotificationService:
    """
    Service for sending notifications to students
    Handles emails, reminders, and study alerts
    """
    
    def __init__(self, mail_config: Dict = None):
        """
        Initialize notification service
        
        Args:
            mail_config: Email configuration dictionary
        """
        self.mail_config = mail_config or {}
        self.smtp_server = self.mail_config.get('MAIL_SERVER', 'smtp.gmail.com')
        self.smtp_port = self.mail_config.get('MAIL_PORT', 587)
        self.smtp_username = self.mail_config.get('MAIL_USERNAME')
        self.smtp_password = self.mail_config.get('MAIL_PASSWORD')
        self.default_sender = self.mail_config.get('MAIL_DEFAULT_SENDER', 'noreply@upsclearning.com')
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   html_body: str = None) -> bool:
        """
        Send an email to a student
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.smtp_username or not self.smtp_password:
            print("Email configuration missing. Email not sent.")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.default_sender
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach plain text body
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach HTML body if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    def send_welcome_email(self, to_email: str, name: str) -> bool:
        """
        Send welcome email to new student
        
        Args:
            to_email: Student's email
            name: Student's name
            
        Returns:
            True if sent successfully
        """
        subject = "Welcome to UPSC Learning System!"
        
        body = f"""
        Dear {name},
        
        Welcome to the AI-Powered Personalized Learning System for UPSC Aspirants!
        
        We're excited to help you on your UPSC journey. Our system will:
        - Analyze your performance and identify weak areas
        - Provide personalized study recommendations
        - Track your progress and suggest improvements
        
        Get started by:
        1. Completing your profile
        2. Taking a diagnostic test
        3. Exploring your personalized dashboard
        
        If you have any questions, feel free to reach out to our support team.
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Welcome to UPSC Learning System, {name}! 🎉</h2>
            <p>We're excited to help you on your UPSC journey.</p>
            <h3>What you can do:</h3>
            <ul>
                <li>📊 Complete your profile for personalized recommendations</li>
                <li>📝 Take a diagnostic test to identify weak areas</li>
                <li>📚 Explore your personalized study plan</li>
                <li>📈 Track your progress with detailed analytics</li>
            </ul>
            <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
            <p>Best regards,<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_recommendation_alert(self, to_email: str, name: str, 
                                   recommendations: List[Dict]) -> bool:
        """
        Send alert about new recommendations
        
        Args:
            to_email: Student's email
            name: Student's name
            recommendations: List of recommendations
            
        Returns:
            True if sent successfully
        """
        subject = "New Personalized Recommendations Available!"
        
        # Build recommendations list
        rec_list = ""
        for rec in recommendations[:5]:  # Top 5 recommendations
            rec_list += f"\n- {rec.get('subject', 'General')}: {rec.get('content', '')[:100]}"
        
        body = f"""
        Dear {name},
        
        We've analyzed your recent performance and have new personalized recommendations for you!
        
        Top Recommendations:{rec_list}
        
        Log in to your dashboard to see all recommendations and start improving.
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>New Recommendations Available! 🎯</h2>
            <p>Dear {name},</p>
            <p>We've analyzed your recent performance and have new personalized recommendations to help you improve.</p>
            <h3>Top Recommendations:</h3>
            <ul>
        """
        
        for rec in recommendations[:5]:
            html_body += f"""
                <li><strong>{rec.get('subject', 'General')}</strong>: {rec.get('content', '')[:150]}...</li>
            """
        
        html_body += """
            </ul>
            <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All Recommendations</a></p>
            <p>Best regards,<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_weekly_report(self, to_email: str, name: str, 
                           report_data: Dict) -> bool:
        """
        Send weekly performance report
        
        Args:
            to_email: Student's email
            name: Student's name
            report_data: Weekly report data
            
        Returns:
            True if sent successfully
        """
        subject = f"Weekly Report: {report_data.get('week_start', '')} to {report_data.get('week_end', '')}"
        
        study_summary = report_data.get('study_summary', {})
        test_summary = report_data.get('test_summary', {})
        
        body = f"""
        Dear {name},
        
        Here's your weekly performance summary:
        
        📚 Study Summary:
        - Total Study Hours: {study_summary.get('total_hours', 0)} hours
        - Average Daily: {study_summary.get('average_daily', 0)} hours
        - Study Streak: {study_summary.get('streak', 0)} days
        - Consistency Score: {study_summary.get('consistency', 0)}%
        
        📝 Mock Test Summary:
        - Tests Taken: {test_summary.get('tests_taken', 0)}
        - Average GS Score: {test_summary.get('average_gs', 0)}
        - Trend: {test_summary.get('trend', 'N/A')}
        - Weekly Improvement: {test_summary.get('weekly_improvement', 0)} points
        
        Recommendations for next week:
        """
        
        for rec in report_data.get('recommendations', []):
            body += f"\n- {rec}"
        
        body += """
        
        Keep up the great work!
        
        Best regards,
        UPSC Learning System Team
        """
        
        # Build HTML version
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Weekly Performance Report</h2>
            <p>Dear {name},</p>
            <p>Here's your performance summary for {report_data.get('week_start', '')} to {report_data.get('week_end', '')}:</p>
            
            <h3>📚 Study Summary</h3>
            <table border="0" cellpadding="10" style="border-collapse: collapse;">
                <tr><th align="left">Metric</th><th align="left">Value</th></tr>
                <tr><td>Total Study Hours</td><td>{study_summary.get('total_hours', 0)} hours</td></tr>
                <tr><td>Average Daily</td><td>{study_summary.get('average_daily', 0)} hours</td></tr>
                <tr><td>Study Streak</td><td>{study_summary.get('streak', 0)} days</td></tr>
                <tr><td>Consistency Score</td><td>{study_summary.get('consistency', 0)}%</td></tr>
            </table>
            
            <h3>📝 Mock Test Summary</h3>
            <table border="0" cellpadding="10" style="border-collapse: collapse;">
                <tr><th align="left">Metric</th><th align="left">Value</th></tr>
                <tr><td>Tests Taken</td><td>{test_summary.get('tests_taken', 0)}</td></tr>
                <tr><td>Average GS Score</td><td>{test_summary.get('average_gs', 0)}</td></tr>
                <tr><td>Trend</td><td>{test_summary.get('trend', 'N/A')}</td></tr>
                <tr><td>Weekly Improvement</td><td>{test_summary.get('weekly_improvement', 0)} points</td></tr>
            </table>
            
            <h3>💡 Recommendations</h3>
            <ul>
        """
        
        for rec in report_data.get('recommendations', []):
            html_body += f"<li>{rec}</li>"
        
        html_body += """
            </ul>
            
            <h3>🏆 Achievements</h3>
            <ul>
        """
        
        for achievement in report_data.get('achievements', []):
            html_body += f"<li>{achievement}</li>"
        
        html_body += """
            </ul>
            
            <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Detailed Report</a></p>
            
            <p>Keep up the great work!<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_study_reminder(self, to_email: str, name: str, 
                            daily_target: float = 6) -> bool:
        """
        Send daily study reminder
        
        Args:
            to_email: Student's email
            name: Student's name
            daily_target: Target study hours per day
            
        Returns:
            True if sent successfully
        """
        subject = "📚 Daily Study Reminder"
        
        body = f"""
        Hello {name},
        
        This is your daily reminder to stay on track with your UPSC preparation!
        
        Today's goal: Study for at least {daily_target} hours.
        
        Remember:
        - Consistency is key to success
        - Take small breaks every hour
        - Review what you studied yesterday
        - Practice at least 50 MCQs today
        
        You've got this! 💪
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>📚 Daily Study Reminder</h2>
            <p>Hello {name},</p>
            <p>This is your daily reminder to stay on track with your UPSC preparation!</p>
            
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 10px;">
                <h3>Today's Goal: Study for at least {daily_target} hours</h3>
            </div>
            
            <h3>Study Tips:</h3>
            <ul>
                <li>✅ Consistency is key to success</li>
                <li>✅ Take small breaks every hour</li>
                <li>✅ Review what you studied yesterday</li>
                <li>✅ Practice at least 50 MCQs today</li>
                <li>✅ Focus on your weak areas first</li>
            </ul>
            
            <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log Your Study Hours</a></p>
            
            <p>You've got this! 💪<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_mock_test_reminder(self, to_email: str, name: str, 
                                 upcoming_tests: List[str]) -> bool:
        """
        Send reminder about upcoming mock tests
        
        Args:
            to_email: Student's email
            name: Student's name
            upcoming_tests: List of upcoming test names
            
        Returns:
            True if sent successfully
        """
        subject = "📝 Upcoming Mock Tests Reminder"
        
        tests_list = "\n".join([f"- {test}" for test in upcoming_tests])
        
        body = f"""
        Hello {name},
        
        Don't forget about your upcoming mock tests!
        
        Scheduled Tests:
        {tests_list}
        
        Mock test tips:
        - Simulate real exam conditions
        - Time yourself strictly
        - Review mistakes after the test
        - Analyze weak areas
        
        Good luck! 🍀
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>📝 Upcoming Mock Tests Reminder</h2>
            <p>Hello {name},</p>
            <p>Don't forget about your upcoming mock tests!</p>
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 10px;">
                <h3>Scheduled Tests:</h3>
                <ul>
        """
        
        for test in upcoming_tests:
            html_body += f"<li>{test}</li>"
        
        html_body += """
                </ul>
            </div>
            
            <h3>Mock Test Tips:</h3>
            <ul>
                <li>🎯 Simulate real exam conditions</li>
                <li>⏰ Time yourself strictly</li>
                <li>📊 Review mistakes after the test</li>
                <li>🎓 Analyze weak areas</li>
            </ul>
            
            <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Test Schedule</a></p>
            
            <p>Good luck! 🍀<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_password_reset_email(self, to_email: str, name: str, 
                                   reset_token: str) -> bool:
        """
        Send password reset email
        
        Args:
            to_email: Student's email
            name: Student's name
            reset_token: Password reset token
            
        Returns:
            True if sent successfully
        """
        subject = "Password Reset Request"
        
        reset_link = f"https://upsclearning.com/reset-password?token={reset_token}"
        
        body = f"""
        Hello {name},
        
        We received a request to reset your password.
        
        Click the link below to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Password Reset Request</h2>
            <p>Hello {name},</p>
            <p>We received a request to reset your password.</p>
            
            <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            
            <p>Best regards,<br>UPSC Learning System Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_progress_milestone(self, to_email: str, name: str, 
                                 milestone: str, details: Dict) -> bool:
        """
        Send congratulatory message for achieving a milestone
        
        Args:
            to_email: Student's email
            name: Student's name
            milestone: Milestone achieved
            details: Additional details about the milestone
            
        Returns:
            True if sent successfully
        """
        subject = f"🎉 Congratulations! You've achieved: {milestone}"
        
        body = f"""
        Hello {name},
        
        Great news! You've achieved a significant milestone:
        
        🏆 {milestone}
        
        Details:
        """
        
        for key, value in details.items():
            body += f"\n- {key}: {value}"
        
        body += """
        
        Keep up the excellent work! Your dedication is paying off.
        
        Best regards,
        UPSC Learning System Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="text-align: center; padding: 20px;">
                <h2>🎉 Congratulations, {name}! 🎉</h2>
                <div style="background-color: #e8f5e9; padding: 20px; border-radius: 10px;">
                    <h3>🏆 {milestone}</h3>
        """
        
        for key, value in details.items():
            html_body += f"<p><strong>{key}:</strong> {value}</p>"
        
        html_body += """
                </div>
                <p>Keep up the excellent work! Your dedication is paying off.</p>
                <p><a href="#" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Share Your Achievement</a></p>
                <p>Best regards,<br>UPSC Learning System Team</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, body, html_body)