# DermaVision Project Documentation PDF Generator
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Output path ───────────────────────────────────────────────────────────────
OUTPUT = r"e:\artifictial intelligence\new derma\DermaVision_Project_Documentation.pdf"

# ─── Colour palette ────────────────────────────────────────────────────────────
TEAL        = colors.HexColor("#0D7377")
TEAL_LIGHT  = colors.HexColor("#14A085")
TEAL_BG     = colors.HexColor("#E8F8F5")
DARK        = colors.HexColor("#1C2833")
SLATE       = colors.HexColor("#2C3E50")
GREY        = colors.HexColor("#566573")
LIGHT_GREY  = colors.HexColor("#F2F3F4")
WHITE       = colors.white
ACCENT      = colors.HexColor("#E74C3C")
GOLD        = colors.HexColor("#F39C12")
PURPLE      = colors.HexColor("#8E44AD")
BLUE        = colors.HexColor("#2980B9")
GREEN       = colors.HexColor("#27AE60")

# ─── Styles ────────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    """Create a named ParagraphStyle."""
    return ParagraphStyle(name, **kw)

TITLE_STYLE   = S("DocTitle",   fontSize=32, leading=40, textColor=WHITE,      alignment=TA_CENTER, fontName="Helvetica-Bold",  spaceAfter=6)
SUB_TITLE     = S("DocSub",     fontSize=14, leading=20, textColor=TEAL_BG,    alignment=TA_CENTER, fontName="Helvetica",       spaceAfter=4)
META_STYLE    = S("DocMeta",    fontSize=10, leading=14, textColor=TEAL_BG,    alignment=TA_CENTER, fontName="Helvetica-Oblique")

H1            = S("H1",         fontSize=22, leading=28, textColor=WHITE,      alignment=TA_LEFT,   fontName="Helvetica-Bold",  spaceBefore=4, spaceAfter=4)
H2            = S("H2",         fontSize=15, leading=20, textColor=TEAL,       alignment=TA_LEFT,   fontName="Helvetica-Bold",  spaceBefore=10, spaceAfter=4)
H3            = S("H3",         fontSize=12, leading=16, textColor=SLATE,      alignment=TA_LEFT,   fontName="Helvetica-Bold",  spaceBefore=6,  spaceAfter=3)

BODY          = S("Body",       fontSize=10, leading=15, textColor=DARK,       alignment=TA_LEFT,   fontName="Helvetica",       spaceAfter=4)
BODY_GREY     = S("BodyGrey",   fontSize=10, leading=15, textColor=GREY,       alignment=TA_LEFT,   fontName="Helvetica",       spaceAfter=4)
BULLET        = S("Bullet",     fontSize=10, leading=15, textColor=DARK,       alignment=TA_LEFT,   fontName="Helvetica",       leftIndent=16, spaceAfter=3, bulletIndent=6)
CODE          = S("Code",       fontSize=9,  leading=13, textColor=SLATE,      alignment=TA_LEFT,   fontName="Courier",         leftIndent=12, spaceAfter=4, backColor=LIGHT_GREY)
CAPTION       = S("Caption",    fontSize=9,  leading=13, textColor=GREY,       alignment=TA_CENTER, fontName="Helvetica-Oblique")
TABLE_HDR     = S("TblHdr",     fontSize=10, leading=14, textColor=WHITE,      alignment=TA_CENTER, fontName="Helvetica-Bold")
TABLE_CELL    = S("TblCell",    fontSize=9,  leading=13, textColor=DARK,       alignment=TA_LEFT,   fontName="Helvetica")
TABLE_CELL_C  = S("TblCellC",   fontSize=9,  leading=13, textColor=DARK,       alignment=TA_CENTER, fontName="Helvetica")
BADGE         = S("Badge",      fontSize=9,  leading=13, textColor=WHITE,      alignment=TA_CENTER, fontName="Helvetica-Bold")
SECTION_INTRO = S("SectionIntro", fontSize=11, leading=16, textColor=SLATE,    alignment=TA_LEFT,   fontName="Helvetica-Oblique", spaceAfter=6)

# ─── Helpers ───────────────────────────────────────────────────────────────────
def hr(color=TEAL, thickness=1.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6, spaceBefore=4)

def section_header(title, color=TEAL, number=None):
    label = f"{number}. {title}" if number else title
    tbl = Table([[Paragraph(label, H1)]], colWidths=[17*cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
    ]))
    return [Spacer(1, 0.3*cm), tbl, Spacer(1, 0.25*cm)]

def sub_header(text, color=TEAL):
    return [Paragraph(text, H2), hr(color, 0.8)]

def bullet(text, symbol="▸"):
    return Paragraph(f"<b>{symbol}</b>  {text}", BULLET)

def bullets(items, symbol="▸"):
    return [bullet(i, symbol) for i in items]

def code_block(text):
    return Paragraph(text, CODE)

def info_box(text, bg=TEAL_BG, border=TEAL):
    tbl = Table([[Paragraph(text, BODY)]], colWidths=[16.5*cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("BOX",           (0,0), (-1,-1), 1.5, border),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
    ]))
    return [tbl, Spacer(1, 0.2*cm)]

def badge_row(items, colors_list):
    cells = [Paragraph(t, BADGE) for t in items]
    tbl = Table([cells], colWidths=[16.5*cm / len(items)] * len(items))
    style = [
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("ROUNDEDCORNERS", [4]),
    ]
    for i, c in enumerate(colors_list):
        style.append(("BACKGROUND", (i,0), (i,0), c))
    tbl.setStyle(TableStyle(style))
    return [tbl, Spacer(1, 0.15*cm)]

def simple_table(headers, rows, col_widths=None, header_color=TEAL):
    header_row = [Paragraph(h, TABLE_HDR) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), TABLE_CELL_C if i > 0 else TABLE_CELL) for i, c in enumerate(row)])
    if col_widths is None:
        col_widths = [16.5*cm / len(headers)] * len(headers)
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND",    (0,0), (-1,0),  header_color),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]
    tbl.setStyle(TableStyle(style))
    return [tbl, Spacer(1, 0.3*cm)]

# ─── Cover Page ────────────────────────────────────────────────────────────────
def cover_page():
    elems = []

    # Big coloured header block
    cover_tbl = Table([[
        Paragraph("DermaVision AI", TITLE_STYLE),
    ]], colWidths=[17*cm])
    cover_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), TEAL),
        ("TOPPADDING",    (0,0), (-1,-1), 40),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LEFTPADDING",   (0,0), (-1,-1), 20),
        ("RIGHTPADDING",  (0,0), (-1,-1), 20),
    ]))
    elems.append(cover_tbl)

    sub_tbl = Table([[
        Paragraph("Skin Disease Analysis Platform", SUB_TITLE),
    ]], colWidths=[17*cm])
    sub_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), TEAL_LIGHT),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    elems.append(sub_tbl)

    meta_tbl = Table([[
        Paragraph("Technical Documentation  |  Backend Architecture  |  AI & RAG System", META_STYLE),
    ]], colWidths=[17*cm])
    meta_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), SLATE),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(meta_tbl)
    elems.append(Spacer(1, 1.2*cm))

    # Highlights grid
    highlights = [
        ("FastAPI + Python", "Backend Framework"),
        ("EfficientNet-B4", "AI Model"),
        ("TF-IDF RAG", "Chatbot Engine"),
        ("SQLAlchemy + Alembic", "Database ORM"),
        ("JWT + bcrypt", "Security"),
        ("Docker Ready", "Deployment"),
    ]
    pairs = [highlights[i:i+3] for i in range(0, len(highlights), 3)]
    for trio in pairs:
        row_data = []
        for tech, label in trio:
            cell = Table([[
                Paragraph(tech,  ParagraphStyle("ct", fontSize=12, fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER)),
                Paragraph(label, ParagraphStyle("cl", fontSize=9,  fontName="Helvetica",      textColor=TEAL_BG, alignment=TA_CENTER)),
            ]], colWidths=[5.5*cm])
            cell.setStyle(TableStyle([
                ("BACKGROUND",    (0,0), (-1,-1), SLATE),
                ("TOPPADDING",    (0,0), (-1,-1), 10),
                ("BOTTOMPADDING", (0,0), (-1,-1), 10),
                ("ROUNDEDCORNERS",[6]),
            ]))
            row_data.append(cell)
        row_tbl = Table([row_data], colWidths=[5.6*cm, 5.6*cm, 5.6*cm])
        row_tbl.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),2),("RIGHTPADDING",(0,0),(-1,-1),2)]))
        elems.append(row_tbl)
        elems.append(Spacer(1, 0.2*cm))

    elems.append(Spacer(1, 0.8*cm))
    elems.append(hr(TEAL, 2))
    elems.append(Paragraph("Version 1.0.0  |  June 2026  |  Backend: Derma-back-main", CAPTION))
    elems.append(PageBreak())
    return elems


# ─── TOC Page ──────────────────────────────────────────────────────────────────
def toc_page():
    elems = []
    elems += section_header("Table of Contents", SLATE)
    elems.append(Spacer(1, 0.3*cm))

    toc_items = [
        ("1", "Project Overview",                  "3"),
        ("2", "Main User Flow",                    "4"),
        ("3", "Architecture & Project Structure",  "5"),
        ("4", "Design Patterns Used",              "6"),
        ("5", "AI Diagnosis System",               "7"),
        ("6", "RAG Chatbot — Deep Dive",           "9"),
        ("7", "Medical Safety Guardrails",         "11"),
        ("8", "Report System",                     "12"),
        ("9", "Security Features",                 "13"),
        ("10","Database — Tables & Columns",       "14"),
        ("11","API Endpoints Reference",           "16"),
        ("12","Frontend Integration",              "18"),
        ("13","DevOps & GitHub Readiness",         "19"),
        ("14","What Makes the Project Strong",     "20"),
    ]

    data = [[Paragraph("#", TABLE_HDR), Paragraph("Section", TABLE_HDR), Paragraph("Page", TABLE_HDR)]]
    for num, title, page in toc_items:
        data.append([
            Paragraph(num, TABLE_CELL_C),
            Paragraph(title, TABLE_CELL),
            Paragraph(page, TABLE_CELL_C),
        ])

    tbl = Table(data, colWidths=[1.5*cm, 13*cm, 2*cm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  TEAL),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, TEAL_BG]),
        ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    elems.append(tbl)
    elems.append(PageBreak())
    return elems
