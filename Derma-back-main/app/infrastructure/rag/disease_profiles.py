"""Disease aliases and safety helpers for local RAG."""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class DiseaseProfile:
    key: str
    display_en: str
    display_ar: str
    aliases: tuple[str, ...]


@dataclass(frozen=True)
class DiseaseSafetyFacts:
    contagion_en: str | None = None
    contagion_ar: str | None = None
    danger_en: str | None = None
    danger_ar: str | None = None
    care_en: tuple[str, ...] = ()
    care_ar: tuple[str, ...] = ()
    urgent_red_flags_en: tuple[str, ...] = ()
    urgent_red_flags_ar: tuple[str, ...] = ()
    treatment_en: tuple[str, ...] = ()
    treatment_ar: tuple[str, ...] = ()
    age_groups_en: str | None = None
    age_groups_ar: str | None = None


DISEASE_PROFILES: dict[str, DiseaseProfile] = {
    "urticaria": DiseaseProfile(
        key="urticaria",
        display_en="Urticaria",
        display_ar="الشرى / الأرتيكاريا",
        aliases=("urticaria", "hives", "wheals", "angioedema"),
    ),
    "psoriasis": DiseaseProfile(
        key="psoriasis",
        display_en="Psoriasis",
        display_ar="الصدفية",
        aliases=("psoriasis", "pasi", "psoriatic"),
    ),
    "tinea": DiseaseProfile(
        key="tinea",
        display_en="Tinea Circinata",
        display_ar="التينيا الحلقية",
        aliases=("tinea", "tinea circinata", "dermatophytosis", "ringworm", "dermatophyte"),
    ),
    "lichen": DiseaseProfile(
        key="lichen",
        display_en="Lichen Planus / Annular Lichen",
        display_ar="الحزاز المسطح / الحزاز الحلقي",
        aliases=("annular lichen", "lichen planus", "lichen"),
    ),
    "mf": DiseaseProfile(
        key="mf",
        display_en="Mycosis Fungoides",
        display_ar="الفطار الفطراني",
        aliases=("mf", "mycosis fungoides", "ctcl", "cutaneous t-cell lymphoma"),
    ),
    "healthy": DiseaseProfile(
        key="healthy",
        display_en="Healthy",
        display_ar="سليم / لا توجد حالة جلدية واضحة",
        aliases=("healthy", "healty", "healthy skin", "normal skin", "skin care", "prevention"),
    ),
}

KNOWN_DISEASE_KEYS = set(DISEASE_PROFILES)

DISEASE_SAFETY_FACTS: dict[str, DiseaseSafetyFacts] = {
    "urticaria": DiseaseSafetyFacts(
        contagion_en=(
            "No, urticaria/hives itself is not contagious and does not spread through touch, "
            "kissing, or shared items. It is usually a hypersensitivity or trigger reaction. "
            "If an underlying infection triggered it, the infection may be contagious, but the hives rash itself is not."
        ),
        contagion_ar=(
            "لا، الشرى / الأرتيكاريا نفسه ليس مرضًا معديًا ولا ينتقل باللمس أو التقبيل أو مشاركة الأدوات. "
            "هو غالبًا تفاعل حساسية أو استجابة لمحفزات مثل أطعمة أو أدوية أو لدغات أو حرارة/برودة أو ضغط أو عدوى أو سبب غير معروف. "
            "إذا كان السبب عدوى، فقد تكون العدوى نفسها معدية، لكن الطفح الشروي نفسه لا ينتقل من شخص لآخر."
        ),
        danger_en=(
            "Urticaria is usually not life-threatening, but it can be dangerous if signs of a severe allergic reaction "
            "or anaphylaxis appear."
        ),
        danger_ar=(
            "غالبًا لا تكون الشرى / الأرتيكاريا مهددة للحياة، لكنها قد تكون خطيرة إذا ظهرت علامات تفاعل تحسسي شديد أو صدمة تحسسية."
        ),
        care_en=(
            "Try to identify and avoid possible triggers such as foods, medicines, heat, cold, pressure, or insect stings.",
            "Keep a simple symptom and trigger diary to discuss with the doctor.",
            "Avoid scratching and use gentle skin care.",
            "Seek medical review if symptoms are recurrent, severe, or affecting daily life.",
        ),
        care_ar=(
            "حاول تحديد المحفزات المحتملة وتجنبها مثل أطعمة أو أدوية أو حرارة/برودة أو ضغط أو لدغات.",
            "احتفظ بملاحظات بسيطة عن الأعراض والمحفزات لمناقشتها مع الطبيب.",
            "تجنب الحك واستخدم عناية لطيفة بالجلد.",
            "راجع الطبيب إذا كانت الأعراض متكررة أو شديدة أو تؤثر على الحياة اليومية.",
        ),
        urgent_red_flags_en=(
            "Difficulty breathing",
            "Swelling of the face, lips, tongue, or throat",
            "Severe dizziness or fainting",
            "Wheezing or severe chest tightness",
            "Rapid spreading with severe general symptoms",
        ),
        urgent_red_flags_ar=(
            "صعوبة في التنفس",
            "تورم الوجه أو الشفاه أو اللسان أو الحلق",
            "دوخة شديدة أو إغماء",
            "صفير أو ضيق شديد بالصدر",
            "انتشار سريع مع أعراض عامة شديدة",
        ),
        treatment_en=(
            "Antihistamines as directed by a doctor",
            "Avoiding possible triggers",
            "Cold compresses or soothing anti-itch care if appropriate",
            "No personal doses from the assistant",
            "A doctor should decide treatment, especially for chronic or severe cases",
        ),
        treatment_ar=(
            "مضادات الهيستامين حسب الطبيب",
            "تجنب المحفزات المحتملة",
            "كمادات باردة أو مهدئات موضعية للحكة إذا مناسبة",
            "لا جرعات شخصية",
            "الطبيب يحدد العلاج، خصوصًا للحالات المزمنة أو الشديدة",
        ),
        age_groups_en=(
            "Urticaria can appear in children or adults. Evaluation and treatment depend on age and symptom severity, "
            "so a dermatologist or pediatrician should review the case if the patient is a child."
        ),
        age_groups_ar=(
            "يمكن أن يظهر الشرى / الأرتيكاريا عند الأطفال أو الكبار. تقييم السبب والعلاج يختلف حسب العمر وشدة الأعراض، "
            "لذلك الأفضل مراجعة طبيب جلدية أو طبيب أطفال إذا كان المريض طفلًا."
        ),
    ),
    "tinea": DiseaseSafetyFacts(
        contagion_en=(
            "Yes, tinea can be contagious because it is a fungal infection. It can spread through direct contact "
            "or contaminated towels, clothing, tools, or shared surfaces."
        ),
        contagion_ar=(
            "نعم، التينيا الحلقية معدية لأنها عدوى فطرية. قد تنتقل بالملامسة المباشرة أو عبر المناشف أو الملابس أو الأدوات أو الأسطح الملوثة."
        ),
        danger_en="In most cases, tinea is not dangerous, but it is contagious and can spread if it is not treated properly.",
        danger_ar="في أغلب الحالات التينيا الحلقية ليست خطيرة، لكنها معدية وقد تنتشر إذا لم تُعالج بشكل مناسب.",
        care_en=(
            "Keep the affected area clean and dry.",
            "Avoid sharing towels, clothing, razors, or personal tools.",
            "Wash towels, clothing, and bedding that may be contaminated.",
            "Seek medical review if it spreads, recurs, affects the scalp, or does not improve.",
        ),
        care_ar=(
            "حافظ على نظافة وجفاف المنطقة المصابة.",
            "تجنب مشاركة المناشف أو الملابس أو أدوات الحلاقة أو الأدوات الشخصية.",
            "اغسل المناشف والملابس والمفارش التي قد تكون ملوثة.",
            "راجع الطبيب إذا انتشرت الحالة أو تكررت أو أصابت فروة الرأس أو لم تتحسن.",
        ),
        urgent_red_flags_en=("Spreading rash despite care", "Scalp involvement", "Pain, pus, or signs of infection"),
        urgent_red_flags_ar=("انتشار الطفح رغم العناية", "إصابة فروة الرأس", "ألم أو صديد أو علامات عدوى"),
        treatment_en=(
            "Antifungal therapy may be used, but the doctor should determine the right option.",
            "Hygiene and keeping the skin dry help reduce spread.",
            "Avoid sharing towels or clothing during the suspected infection.",
            "Do not use random creams without medical advice.",
        ),
        treatment_ar=(
            "قد تُستخدم علاجات مضادة للفطريات، لكن الطبيب هو من يحدد الخيار المناسب.",
            "النظافة والحفاظ على جفاف الجلد يساعدان في تقليل الانتشار.",
            "تجنب مشاركة المناشف أو الملابس أثناء الاشتباه بالعدوى.",
            "لا تستخدم كريمات عشوائية دون استشارة طبية.",
        ),
        age_groups_en="Tinea can affect children and adults. Children should be reviewed by a doctor, especially with scalp involvement or spreading rash.",
        age_groups_ar="يمكن أن تصيب التينيا الأطفال والكبار. يُفضّل مراجعة الطبيب للأطفال خصوصًا إذا أصابت فروة الرأس أو كان الطفح ينتشر.",
    ),
    "psoriasis": DiseaseSafetyFacts(
        contagion_en="Psoriasis is not contagious and does not spread from person to person through touch.",
        contagion_ar="الصدفية ليست معدية ولا تنتقل من شخص لآخر باللمس.",
        care_en=("Moisturize regularly.", "Avoid scratching and known triggers.", "Ask a dermatologist if symptoms are widespread, painful, recurrent, or affecting joints."),
        care_ar=("استخدم المرطبات بانتظام.", "تجنب الحك والمحفزات المعروفة.", "راجع طبيب الجلدية إذا كانت الأعراض منتشرة أو مؤلمة أو متكررة أو تؤثر على المفاصل."),
        treatment_en=("Treatment choice depends on severity and location and should be decided by a dermatologist.", "Topical treatments, light-based options, or systemic treatments may be considered under medical supervision."),
        treatment_ar=("اختيار العلاج يعتمد على الشدة والمكان ويجب أن يحدده طبيب الجلدية.", "قد تُناقش علاجات موضعية أو ضوئية أو جهازية تحت إشراف طبي."),
        age_groups_en="Psoriasis can affect different age groups, including children and adults, but evaluation depends on severity and symptoms.",
        age_groups_ar="يمكن أن تظهر الصدفية في أعمار مختلفة بما في ذلك الأطفال والكبار، لكن التقييم يعتمد على شدة الأعراض.",
    ),
    "lichen": DiseaseSafetyFacts(
        contagion_en="Lichen planus is generally not contagious and does not spread from person to person through touch.",
        contagion_ar="الحزاز المسطح / الحزاز الحلقي غالبًا ليس معديًا ولا ينتقل من شخص لآخر باللمس.",
        care_en=("Avoid scratching or irritating lesions.", "Maintain follow-up with a dermatologist.", "Seek review for mouth, nail, or painful lesions."),
        care_ar=("تجنب الحك أو تهييج الآفات.", "حافظ على المتابعة مع طبيب الجلدية.", "راجع الطبيب عند وجود آفات في الفم أو الأظافر أو آفات مؤلمة."),
        treatment_en=("Treatment depends on location and severity and should be selected by a dermatologist.", "Do not self-start strong topical or systemic medicines."),
        treatment_ar=("العلاج يعتمد على المكان والشدة ويجب أن يختاره طبيب الجلدية.", "لا تبدأ أدوية موضعية قوية أو جهازية من نفسك."),
        age_groups_en="Lichen planus can occur in adults and less commonly in children. A dermatologist should confirm the diagnosis.",
        age_groups_ar="قد يظهر الحزاز المسطح / الحزاز الحلقي عند الكبار وأحيانًا عند الأطفال، ويجب تأكيده مع طبيب الجلدية.",
    ),
    "mf": DiseaseSafetyFacts(
        contagion_en="Mycosis Fungoides is not a contagious infection and does not spread by casual contact.",
        contagion_ar="الفطار الفطراني ليس عدوى معدية ولا ينتقل بالمخالطة العادية.",
        care_en=("Do not self-diagnose.", "Keep specialist dermatology follow-up.", "Report persistent, spreading, bleeding, or ulcerated lesions promptly."),
        care_ar=("لا تعتمد على التشخيص الذاتي.", "حافظ على المتابعة مع طبيب جلدية متخصص.", "أبلغ الطبيب سريعًا عن الآفات المستمرة أو المنتشرة أو النازفة أو المتقرحة."),
        treatment_en=("Management requires specialist dermatology evaluation.", "Strong or specialist treatments are only under medical supervision."),
        treatment_ar=("التعامل مع الحالة يحتاج تقييمًا متخصصًا من طبيب جلدية.", "العلاجات القوية أو المتخصصة تكون فقط تحت إشراف طبي."),
        age_groups_en="Mycosis Fungoides is more common in adults and needs specialist dermatology evaluation.",
        age_groups_ar="الفطار الفطراني أكثر شيوعًا عند البالغين ويحتاج إلى تقييم متخصص من طبيب جلدية.",
    ),
    "healthy": DiseaseSafetyFacts(
        contagion_en="A healthy result does not identify a contagious supported skin condition.",
        contagion_ar="نتيجة الجلد السليم لا تشير إلى حالة جلدية معدية ضمن الحالات المدعومة.",
        care_en=("Continue gentle skin care.", "Use sun protection.", "Monitor new, changing, painful, bleeding, or concerning spots."),
        care_ar=("استمر في العناية اللطيفة بالبشرة.", "استخدم واقي الشمس.", "راقب أي بقع جديدة أو متغيرة أو مؤلمة أو نازفة أو مقلقة."),
        treatment_en=("No medicine is suggested for a healthy result.", "If symptoms exist despite the result, a clinician should examine the skin."),
        treatment_ar=("لا يتم اقتراح دواء عند ظهور نتيجة سليمة.", "إذا وُجدت أعراض رغم النتيجة، يجب فحص الجلد بواسطة طبيب."),
        age_groups_en="A healthy prediction can occur at any age, but symptoms or changing lesions should still be reviewed by a clinician.",
        age_groups_ar="قد تظهر نتيجة سليمة في أي عمر، لكن وجود أعراض أو تغيرات جلدية يستدعي مراجعة الطبيب.",
    ),
}

TREATMENT_QUESTION_TERMS = {
    "treatment",
    "treat",
    "treated",
    "therapy",
    "therapies",
    "medication",
    "medications",
    "medicine",
    "medicines",
    "drug",
    "drugs",
    "options",
    "management",
    "manage",
    "علاج",
    "يعالج",
    "الأدوية",
    "ادوية",
    "دواء",
    "خيارات",
}

TREATMENT_CONTENT_TERMS = {
    "treatment",
    "treated",
    "therapy",
    "medication",
    "medications",
    "drugs",
    "protocol",
    "prescribed",
    "topical",
    "steroid",
    "antihistamine",
    "antifungal",
    "phototherapy",
    "chemotherapy",
    "biological",
    "methotrexate",
    "folic acid",
    "prednisolone",
    "emollients",
    "keratolytics",
    "ketoconazole",
    "refer",
    "nuclear scan",
    "scan",
    "soothing",
    "exposure to antigen",
    "vitamin d",
    "علاج",
    "دواء",
}

STRONG_TREATMENT_TERMS = {
    "methotrexate",
    "systemic prednisolone",
    "prednisolone",
    "prednisone",
    "systemic steroids",
    "systemic corticosteroids",
    "biological treatment",
    "biologic",
    "biological",
    "chemotherapy",
    "oncology",
    "phototherapy",
    "cyclosporine",
    "mechlorethamine",
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def canonical_disease(label: str) -> str:
    text = normalize_text(label)
    if not text:
        return "unknown"
    if "urticaria" in text or "hives" in text:
        return "urticaria"
    if "psoriasis" in text or "psoriatic" in text:
        return "psoriasis"
    if "tinea" in text or "ringworm" in text or "dermatophytosis" in text:
        return "tinea"
    if "annular lichen" in text or "lichen planus" in text or re.search(r"\blichen\b", text):
        return "lichen"
    if "mycosis fungoides" in text or "ctcl" in text or re.search(r"\bmf\b", text):
        return "mf"
    if "healthy" in text or "healty" in text or "normal skin" in text:
        return "healthy"
    return "unknown"


def get_profile(label: str) -> DiseaseProfile | None:
    return DISEASE_PROFILES.get(canonical_disease(label))


def get_safety_facts(label: str | None) -> DiseaseSafetyFacts | None:
    return DISEASE_SAFETY_FACTS.get(canonical_disease(label or ""))


def canonical_display_name(label: str | None, language: str = "en", include_english_in_arabic: bool = True) -> str:
    """Return the canonical user-facing disease name for local and LLM answers."""
    profile = get_profile(label or "")
    if not profile:
        return str(label or "Unknown")
    if language == "ar":
        if include_english_in_arabic:
            return f"{profile.display_ar} ({profile.display_en})"
        return profile.display_ar
    return profile.display_en


def canonical_name_instructions(label: str | None) -> str:
    """Provider prompt instructions that prevent free translation of disease names."""
    profile = get_profile(label or "")
    if not profile:
        return (
            f"Raw predicted label: {label or 'Unknown'}\n"
            "No canonical disease mapping was found. Do not invent a disease name."
        )
    return (
        f"Canonical disease key: {profile.key}\n"
        f"Canonical English name: {profile.display_en}\n"
        f"Canonical Arabic name: {profile.display_ar} ({profile.display_en})\n"
        "Use these canonical names exactly in user-facing answers."
    )


def contains_alias(text: str, profile: DiseaseProfile) -> bool:
    normalized = normalize_text(text)
    return any(_contains_phrase(normalized, alias) for alias in profile.aliases)


def detect_disease_keys(text: str) -> tuple[str, ...]:
    matches = [
        key for key, profile in DISEASE_PROFILES.items()
        if contains_alias(text, profile)
    ]
    return tuple(matches)


def is_treatment_question(text: str) -> bool:
    normalized = normalize_text(text)
    return any(term in normalized for term in TREATMENT_QUESTION_TERMS)


def has_treatment_content(text: str) -> bool:
    normalized = normalize_text(text)
    return any(term in normalized for term in TREATMENT_CONTENT_TERMS)


def has_strong_treatment(text: str) -> bool:
    normalized = normalize_text(text)
    return any(term in normalized for term in STRONG_TREATMENT_TERMS)


def _contains_phrase(text: str, phrase: str) -> bool:
    phrase = normalize_text(phrase)
    if not phrase:
        return False
    if phrase == "mf":
        return re.search(r"\bmf\b", text) is not None
    return phrase in text
