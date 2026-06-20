from sqlalchemy.orm import Session
from models.models import ScanSession, ClaimScore, FailureMatch, ValueProposition, MisalignmentFlag, CompetitorProduct
import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
import collections

def generate_brief_pdf(db_session: Session, scan_id: str) -> str:
    # Gather data
    scan = db_session.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise ValueError("Scan not found")

    claim_scores = db_session.query(ClaimScore).filter(ClaimScore.scan_id == scan_id).all()
    failure_matches = db_session.query(FailureMatch).filter(FailureMatch.scan_id == scan_id).order_by(FailureMatch.rank.asc()).all()
    value_propositions = db_session.query(ValueProposition).filter(ValueProposition.scan_id == scan_id).order_by(ValueProposition.rank.asc()).all()
    misalignment_flags = db_session.query(MisalignmentFlag).filter(MisalignmentFlag.scan_id == scan_id).all()

    # Competitor stats
    all_competitors = db_session.query(CompetitorProduct).filter(CompetitorProduct.category_code == scan.category_code).all()
    tier_distribution = collections.Counter([c.price_tier for c in all_competitors])
    
    stats = {
        "total_competitors": len(all_competitors),
        "tier_distribution": dict(tier_distribution),
        "total_competitors_in_tier": tier_distribution.get(scan.target_price_tier, 0)
    }

    # Setup Jinja
    env = Environment(loader=FileSystemLoader(searchpath=os.path.join(os.path.dirname(__file__), '..', 'templates')))
    template = env.get_template('brand_brief.html')

    html_out = template.render(
        date=datetime.now().strftime("%Y-%m-%d"),
        scan=scan,
        claim_scores=claim_scores,
        failure_matches=failure_matches,
        value_propositions=value_propositions,
        misalignment_flags=misalignment_flags,
        stats=stats
    )

    # Convert to PDF
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'generated_briefs')
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, f"{scan_id}.pdf")

    with open(pdf_path, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(html_out, dest=result_file)
        if pisa_status.err:
            raise Exception("Failed to generate PDF")

    return pdf_path
