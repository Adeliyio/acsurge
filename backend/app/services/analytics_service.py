from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import datetime, timedelta
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
import base64
from app.models.ad_analysis import AdAnalysis
from app.models.user import User

class AnalyticsService:
    """Service for analytics and reporting"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_analytics(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        # Get user's analyses
        analyses = self.db.query(AdAnalysis)\
                          .filter(AdAnalysis.user_id == user_id)\
                          .all()
        
        if not analyses:
            return {
                'total_analyses': 0,
                'avg_score_improvement': 0,
                'top_performing_platforms': [],
                'monthly_usage': {},
                'subscription_analytics': {}
            }
        
        # Calculate metrics
        total_analyses = len(analyses)
        avg_score = sum(a.overall_score for a in analyses) / total_analyses
        
        # Platform performance
        platform_stats = {}
        for analysis in analyses:
            platform = analysis.platform
            if platform not in platform_stats:
                platform_stats[platform] = {'count': 0, 'total_score': 0}
            platform_stats[platform]['count'] += 1
            platform_stats[platform]['total_score'] += analysis.overall_score
        
        top_performing_platforms = [
            {
                'platform': platform,
                'avg_score': stats['total_score'] / stats['count'],
                'count': stats['count']
            }
            for platform, stats in platform_stats.items()
        ]
        top_performing_platforms.sort(key=lambda x: x['avg_score'], reverse=True)
        
        # Monthly usage (last 6 months)
        monthly_usage = self._get_monthly_usage(user_id)
        
        # Subscription analytics
        user = self.db.query(User).filter(User.id == user_id).first()
        subscription_analytics = {
            'current_tier': user.subscription_tier.value if user else 'free',
            'monthly_analyses': user.monthly_analyses if user else 0,
            'account_age_days': (datetime.utcnow() - user.created_at).days if user else 0
        }
        
        return {
            'total_analyses': total_analyses,
            'avg_score_improvement': round(avg_score, 1),
            'top_performing_platforms': top_performing_platforms,
            'monthly_usage': monthly_usage,
            'subscription_analytics': subscription_analytics
        }
    
    def _get_monthly_usage(self, user_id: int) -> List[Dict]:
        """Get monthly usage statistics for last 6 months"""
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        
        # Query monthly data
        monthly_data = self.db.query(
            func.date_trunc('month', AdAnalysis.created_at).label('month'),
            func.count(AdAnalysis.id).label('analyses'),
            func.avg(AdAnalysis.overall_score).label('avg_score')
        ).filter(
            AdAnalysis.user_id == user_id,
            AdAnalysis.created_at >= six_months_ago
        ).group_by(
            func.date_trunc('month', AdAnalysis.created_at)
        ).order_by(
            func.date_trunc('month', AdAnalysis.created_at)
        ).all()
        
        return [
            {
                'month': row.month.strftime('%b %Y'),
                'analyses': row.analyses,
                'avg_score': round(float(row.avg_score), 1) if row.avg_score else 0
            }
            for row in monthly_data
        ]
    
    async def generate_pdf_report(self, user_id: int, analysis_ids: List[str]) -> Dict[str, str]:
        """Generate PDF report for selected analyses"""
        # Get analyses
        analyses = self.db.query(AdAnalysis)\
                          .filter(\n                              AdAnalysis.user_id == user_id,\n                              AdAnalysis.id.in_(analysis_ids)\n                          )\
                          .all()
        
        if not analyses:
            raise ValueError("No analyses found")
        
        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph("AdCopySurge Analysis Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Summary
        avg_score = sum(a.overall_score for a in analyses) / len(analyses)
        summary_text = f\"\"\"
        Report Generated: {datetime.utcnow().strftime('%B %d, %Y')}<br/>\n        Total Analyses: {len(analyses)}<br/>\n        Average Score: {avg_score:.1f}/100<br/>\n        \"\"\"\n        summary = Paragraph(summary_text, styles['Normal'])\n        story.append(summary)\n        story.append(Spacer(1, 20))\n        \n        # Analysis details\n        for i, analysis in enumerate(analyses, 1):\n            # Analysis header\n            header = Paragraph(f\"Analysis #{i}: {analysis.headline}\", styles['Heading2'])\n            story.append(header)\n            \n            # Scores table\n            scores_data = [\n                ['Metric', 'Score'],\n                ['Overall Score', f\"{analysis.overall_score:.1f}/100\"],\n                ['Clarity', f\"{analysis.clarity_score:.1f}/100\"],\n                ['Persuasion', f\"{analysis.persuasion_score:.1f}/100\"],\n                ['Emotion', f\"{analysis.emotion_score:.1f}/100\"],\n                ['CTA Strength', f\"{analysis.cta_strength_score:.1f}/100\"],\n                ['Platform Fit', f\"{analysis.platform_fit_score:.1f}/100\"],\n            ]\n            \n            scores_table = Table(scores_data)\n            scores_table.setStyle(TableStyle([\n                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),\n                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),\n                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),\n                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),\n                ('FONTSIZE', (0, 0), (-1, 0), 14),\n                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),\n                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),\n                ('GRID', (0, 0), (-1, -1), 1, colors.black)\n            ]))\n            \n            story.append(scores_table)\n            story.append(Spacer(1, 20))\n            \n            # Ad content\n            content_text = f\"\"\"<br/>\n            <b>Platform:</b> {analysis.platform}<br/>\n            <b>Headline:</b> {analysis.headline}<br/>\n            <b>Body:</b> {analysis.body_text}<br/>\n            <b>CTA:</b> {analysis.cta}<br/>\n            \"\"\"\n            content = Paragraph(content_text, styles['Normal'])\n            story.append(content)\n            story.append(Spacer(1, 30))\n        \n        # Build PDF\n        doc.build(story)\n        buffer.seek(0)\n        pdf_data = buffer.getvalue()\n        buffer.close()\n        \n        # Encode PDF as base64 for return\n        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')\n        \n        return {\n            'url': f\"data:application/pdf;base64,{pdf_base64}\",\n            'download_link': f\"report_{user_id}_{datetime.utcnow().strftime('%Y%m%d')}.pdf\"\n        }
    
    def get_platform_performance(self, user_id: int) -> Dict[str, Any]:
        \"\"\"Get performance breakdown by platform\"\"\"
        platform_stats = self.db.query(\n            AdAnalysis.platform,\n            func.count(AdAnalysis.id).label('count'),\n            func.avg(AdAnalysis.overall_score).label('avg_score'),\n            func.max(AdAnalysis.overall_score).label('max_score')\n        ).filter(\n            AdAnalysis.user_id == user_id\n        ).group_by(\n            AdAnalysis.platform\n        ).all()\n        \n        return [\n            {\n                'platform': row.platform,\n                'total_analyses': row.count,\n                'avg_score': round(float(row.avg_score), 1),\n                'best_score': round(float(row.max_score), 1)\n            }\n            for row in platform_stats\n        ]
