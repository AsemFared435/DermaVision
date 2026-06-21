"""Question intent detection for DermaVision RAG."""
from __future__ import annotations

import re

from app.infrastructure.rag.disease_profiles import normalize_text

ARABIC_CHAR_PATTERN = re.compile(r"[\u0600-\u06FF]")
ARABIC_DIACRITICS_PATTERN = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")
ARABIC_TRANSLATION_TABLE = str.maketrans({
    "أ": "ا",
    "إ": "ا",
    "آ": "ا",
    "ة": "ه",
    "ى": "ي",
    "ـ": "",
})

URGENT_TERMS = (
    "urgent",
    "emergency",
    "danger",
    "red flag",
    "red flags",
    "is it dangerous",
    "is this dangerous",
    "doctor",
    "hospital",
    "severe",
    "breathing",
    "pus",
    "fever",
    "infection",
    "can i die",
    "will i die",
    "death",
    "fatal",
    "deadly",
    "kill me",
    "life threatening",
    "life-threatening",
    "can this disease kill me",
    "رعاية عاجلة",
    "خطر",
    "خطير",
    "هل خطير",
    "هل هو خطير",
    "هل المرض خطير",
    "هل المرض دا خطير",
    "هل المرض ده خطير",
    "هل خطير ولا عادي",
    "امتى اروح دكتور",
    "امتي اروح دكتور",
    "طوارئ",
    "دكتور",
    "طبيب",
    "مستشفى",
    "حمى",
    "صديد",
    "تنفس",
    "عدوى",
    "ممكن اموت",
    "هموت",
    "اموت",
    "موت",
    "يقتلني",
    "يسبب وفاة",
    "يسبب وفاه",
    "يؤدي للوفاة",
    "يؤدي للوفاه",
    "خطر على حياتي",
    "يهدد حياتي",
    "مميت",
    "قاتل",
    "اخاف اموت",
    "ممكن المرض يسبب موتي",
    "ممكن المرض يسبب في موتي",
    "لو لقيت المرض شديد",
    "لازم اروح لدكتور",
    "اروح لدكتور",
    "اروح طبيب",
)

TREATMENT_TERMS = (
    "treatment",
    "medicine",
    "medication",
    "medications",
    "drugs",
    "cream",
    "therapy",
    "treat",
    "treatment options",
    "علاج",
    "علاجات",
    "العلاج اي",
    "علاجه اي",
    "اي العلاج",
    "دواء",
    "دوا",
    "أدوية",
    "ادوية",
    "ادويه",
    "كريم",
    "مرهم",
    "مراهم",
    "مضاد",
    "مضادات",
    "فطريات",
    "مضاد فطري",
    "اقترح لي",
    "رشح لي",
    "اكتبلي علاج",
    "اكتب لي علاج",
)

SYMPTOM_TERMS = (
    "symptoms",
    "symptom",
    "signs",
    "sign",
    "itch",
    "itching",
    "pain",
    "rash",
    "swelling",
    "what are symptoms",
    "أعراض",
    "اعراض",
    "اعراضه",
    "اعراضه اي",
    "علامات",
    "حكة",
    "ألم",
    "الم",
    "طفح",
    "تورم",
)

OVERVIEW_TERMS = (
    "what is",
    "explain",
    "what should i know",
    "condition",
    "disease",
    "meaning",
    "mean",
    "about",
    "اشرح",
    "ما هو",
    "ما هي",
    "ماذا يعني",
    "عايز أعرف",
    "عايز اعرف",
    "الحالة",
    "المرض",
)

CARE_TERMS = (
    "care",
    "prevention",
    "prevent",
    "avoid",
    "what should i do",
    "what can i do",
    "hygiene",
    "skincare",
    "skin care",
    "نصائح",
    "عناية",
    "وقاية",
    "أتجنب",
    "اتجنب",
    "نظافة",
    "اعمل ايه",
)

DOCTOR_QUESTION_TERMS = (
    "what questions should i ask the dermatologist",
    "what should i ask the dermatologist",
    "what questions should i ask my dermatologist",
    "questions for dermatologist",
    "questions to ask dermatologist",
    "ask the dermatologist",
    "ask my dermatologist",
    "doctor questions",
    "dermatologist questions",
    "ما الأسئلة التي أطرحها على طبيب الجلدية",
    "ما الاسئله التي اطرحها علي طبيب الجلديه",
    "ما الاسئلة التي اطرحها على طبيب الجلدية",
    "اسال طبيب الجلدية ايه",
    "اسأل طبيب الجلدية ايه",
    "اسأل الدكتور ايه",
    "اسال الدكتور ايه",
    "اسئلة للدكتور",
    "اسئله للدكتور",
    "اسئلة لطبيب الجلدية",
    "اسئله لطبيب الجلديه",
    "اطرحها على طبيب الجلدية",
    "اطرحها علي طبيب الجلديه",
)

AGE_GROUP_TERMS = (
    "children",
    "child",
    "kids",
    "kid",
    "adults",
    "adult",
    "elderly",
    "older people",
    "can children get it",
    "can kids get it",
    "can adults get it",
    "affect children",
    "affects children",
    "affect adults",
    "affects adults",
    "بيجي للاطفال",
    "بيجي للأطفال",
    "يصيب الاطفال",
    "يصيب الأطفال",
    "يجي للاطفال",
    "يجي للأطفال",
    "هل يصيب الاطفال",
    "هل يصيب الأطفال",
    "يصيب الكبار",
    "يجي للكبار",
    "بيجي للكبار",
    "عند الاطفال",
    "عند الأطفال",
    "عند الكبار",
    "للاطفال",
    "للأطفال",
    "الاطفال",
    "الأطفال",
    "الكبار",
)

URGENT_RISK_TERMS = (
    "urgent",
    "emergency",
    "danger",
    "dangerous",
    "red flag",
    "red flags",
    "severe",
    "breathing",
    "pus",
    "fever",
    "infection",
    "can i die",
    "will i die",
    "death",
    "fatal",
    "deadly",
    "kill me",
    "life threatening",
    "رعاية عاجلة",
    "خطر",
    "خطير",
    "طوارئ",
    "شديد",
    "تنفس",
    "تورم",
    "دوخة",
    "دوخه",
    "إغماء",
    "اغماء",
    "حمى",
    "حمي",
    "صديد",
    "اموت",
    "موت",
    "هموت",
    "مميت",
    "قاتل",
    "حياتي",
    "وفاة",
    "وفاه",
    "يسبب موتي",
    "يسبب وفاه",
    "يسبب وفاة",
)

DIAGNOSIS_RESULT_TERMS = (
    "explain this condition",
    "what condition came out",
    "what disease did i get",
    "what is the diagnosis",
    "what is my diagnosis",
    "what diagnosis did i get",
    "what condition is this",
    "what did the image show",
    "what did the report say",
    "what is my result",
    "what did the report show",
    "tell me about the disease",
    "explain the disease",
    "predicted disease",
    "predicted condition",
    "what is it",
    "what disease is this",
    "what is the disease",
    "فهمني المرض",
    "فهمني اي المرض",
    "فهمني ايه المرض",
    "اي هو المرض",
    "اي هو المرض اللي عندي",
    "اي هو المرض الي عندي",
    "اي المرض ده",
    "اي المرض دا",
    "اي المرض الي عندي",
    "اي المرض اللي عندي",
    "ايه المرض ده",
    "ايه المرض دا",
    "اي المرض اللي طلع",
    "اي المرض الي طلع",
    "المرض اللي طلعلي",
    "المرض الي طلعلي",
    "المرض اللي خرجلي",
    "المرض الي خرجلي",
    "المرض اللي ظهر",
    "المرض الي ظهر",
    "التشخيص اللي طلع",
    "التشخيص الي طلع",
    "النتيجة اللي طلعت",
    "النتيجه اللي طلعت",
    "النتيجة الي طلعت",
    "النتيجه الي طلعت",
    "ايه الحالة",
    "ايه الحاله",
    "اشرحلي الحالة",
    "اشرحلي الحاله",
    "اشرح المرض",
    "عرفني عن المرض",
    "تعرفني عن المرض",
    "التشخيص",
    "تشخيص",
    "النتيجة",
    "نتيجة",
    "طلع ايه",
    "اللي طلع",
    "ايه اللي طلع",
    "عندي ايه",
    "عندي اي",
    "انا عندي ايه",
    "انا عندي اي",
    "ينفع تعرفني انا عندي اي",
    "عندي مرض اي",
    "ينفع تعرفني انا عندي مرض اي",
    "المرض ايه",
    "المرض اي",
    "اسم المرض",
    "ما اسم المرض",
    "ما اسم المرض الي عندي",
    "ما اسم المرض اللي عندي",
    "اسم الحالة",
    "اسم الحاله",
    "الحالة ايه",
    "الحاله ايه",
    "التقرير قال ايه",
    "التقرير بيقول ايه",
    "الصورة طلعت ايه",
    "الصوره طلعت ايه",
    "التحليل طلع ايه",
    "تحليل الصورة",
    "تحليل الصوره",
    "نتيجة الصورة",
    "نتيجه الصوره",
)

DIAGNOSIS_CONFIRMATION_TERMS = (
    "so i have",
    "do i have",
    "does this mean i have",
    "so the disease is",
    "so it is",
    "يعني عندي",
    "يعني انا عندي",
    "يعني المرض اسمه",
    "يعني المرض اللي عندي اسمه",
    "يعني المرض الي عندي اسمه",
    "يعني الحالة اسمها",
    "يعني الحاله اسمها",
    "هل عندي",
    "يبقى عندي",
    "يبقي عندي",
    "طلع عندي",
)

DOSAGE_DURATION_TERMS = (
    "how many use treatment",
    "how many times",
    "how often",
    "how long",
    "duration",
    "dose",
    "dosage",
    "frequency",
    "use it how many",
    "how many times should i use",
    "how long should i use",
    "how long treatment",
    "treatment duration",
    "treatment frequency",
    "كام مرة",
    "كام مره",
    "كل قد ايه",
    "استخدمه كام مرة",
    "استخدمه كام مره",
    "استخدم العلاج كام مرة",
    "استخدم العلاج كام مره",
    "لمدة كام يوم",
    "لمده كام يوم",
    "مدة العلاج",
    "مده العلاج",
    "الجرعة",
    "الجرعه",
    "جرعة",
    "جرعه",
    "عدد المرات",
    "قد ايه استخدمه",
)

CONTAGION_TRANSMISSION_TERMS = (
    "contagious",
    "is it contagious",
    "can it spread",
    "spread",
    "transmission",
    "transmit",
    "infectious",
    "infection spread",
    "how does it spread",
    "can i infect someone",
    "can it pass to others",
    "معدي",
    "معدية",
    "هل معدي",
    "هل المرض معدي",
    "بيعدي",
    "هل بيعدي",
    "بينتقل",
    "ينتقل",
    "انتقال",
    "العدوى",
    "عدوى",
    "اتنقل",
    "يتنقل",
    "ينتشر",
    "بينتشر",
    "ينتشر ازاي",
    "بيتنقل ازاي",
    "اخاف يعدي حد",
    "ممكن يعدي حد",
    "ينفع انقل العدوى",
    "اعدي حد",
    "هل هو فيروس",
    "هل هو بكتيريا",
    "هل هو فطريات",
)

PRESCRIPTION_TERMS = (
    "should i take",
    "can i take",
    "should i use",
    "can i use",
    "dose",
    "dosage",
    "prescribe",
    "prescription",
    "how much",
    "how many mg",
    "هل آخذ",
    "هل اخذ",
    "ينفع اخد",
    "ينفع آخذ",
    "ينفع استخدم",
    "أستخدم",
    "استخدم",
    "استخدم ايه",
    "اخد ايه",
    "جرعة",
    "جرعه",
    "وصفة",
    "وصفه",
    "هل اخد",
)

NON_DERM_EMERGENCY_TERMS = (
    "chest pain",
    "heart attack",
    "stroke",
    "suicidal",
    "can't breathe",
    "cannot breathe",
    "ألم صدر",
    "الم صدر",
    "جلطة",
    "انتحار",
)

OUT_OF_SCOPE_TERMS = (
    "python code",
    "javascript",
    "capital of",
    "weather",
    "recipe",
    "write code",
    "programming",
    "stock price",
    "football",
    "soccer",
    "ما عاصمة",
    "برمجة",
    "كود",
    "بايثون",
    "اكتبلي كود",
    "اكتب لي كود",
    "طقس",
    "بتحبني",
    "بتحبيني",
    "تحبني",
    "بتحب",
    "عامل ايه",
    "اخبارك",
    "مين انت",
    "انت مين",
    "نكتة",
    "نكته",
    "هزار",
    "احكيلي",
    "غنيلي",
    "اكتب شعر",
    "اكتب قصة",
    "اكتب قصه",
    "عاصمة",
    "عاصمه",
    "رياضة",
    "رياضه",
    "ماتش",
    "طبخ",
    "اكل",
    "سفر",
)

ARABIC_MEDICAL_TERMS = (
    "التشخيص",
    "تشخيص",
    "النتيجة",
    "نتيجة",
    "نتيجه",
    "تقرير",
    "التقرير",
    "صورة",
    "صوره",
    "الصورة",
    "الصوره",
    "تحليل",
    "التحليل",
    "مرض",
    "حالة",
    "حاله",
    "جلد",
    "جلدية",
    "جلديه",
    "طفح",
    "حكة",
    "حكه",
    "ألم",
    "الم",
    "احمرار",
    "أعراض",
    "اعراض",
    "علامات",
    "علاج",
    "دواء",
    "دوا",
    "أدوية",
    "ادوية",
    "ادويه",
    "كريم",
    "مرهم",
    "مراهم",
    "عناية",
    "عنايه",
    "وقاية",
    "وقايه",
    "دكتور",
    "طبيب",
    "طوارئ",
    "عاجلة",
    "عاجله",
    "خطر",
    "خطير",
    "موت",
    "اموت",
    "مميت",
    "قاتل",
    "حياتي",
    "وفاة",
    "وفاه",
    "اطفال",
    "الأطفال",
    "الاطفال",
    "كبار",
    "الكبار",
    "عدوى",
    "عدوه",
    "معدي",
    "معدية",
    "بيعدي",
    "بينتقل",
    "ينتقل",
    "انتقال",
    "العدوى",
    "اتنقل",
    "يتنقل",
    "ينتشر",
    "بينتشر",
    "فيروس",
    "بكتيريا",
    "فطريات",
    "تينيا",
    "صدفية",
    "صدفيه",
    "ارتيكاريا",
    "أرتيكاريا",
    "شرى",
    "الشري",
    "الشرى",
)

ANSWER_INTENT_ORDER = (
    "diagnosis_result",
    "diagnosis_confirmation",
    "overview",
    "contagion_transmission",
    "symptoms",
    "treatment",
    "prescription_request",
    "dosage_duration",
    "urgent_care",
    "prevention_care",
    "doctor_questions",
    "age_groups",
    "out_of_scope",
)

NON_RETRIEVAL_INTENTS = {
    "out_of_scope",
    "non_derm_emergency",
    "dosage_duration",
    "unclear_medical",
}


def contains_arabic(text: str) -> bool:
    """Return True when text contains Arabic characters."""
    return bool(ARABIC_CHAR_PATTERN.search(text or ""))


def normalize_arabic(text: str) -> str:
    """Normalize common Arabic spelling variants before keyword matching."""
    normalized = (text or "").translate(ARABIC_TRANSLATION_TABLE)
    normalized = ARABIC_DIACRITICS_PATTERN.sub("", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def detect_question_intent(message: str) -> str:
    """Return a coarse intent used to focus retrieval and generation."""
    return detect_question_intents(message)[0]


def detect_question_intents(message: str) -> list[str]:
    """Return ordered intents so compound medical questions keep all parts."""
    text = normalize_text(normalize_arabic(message))
    is_arabic = contains_arabic(message)

    if text and not re.search(r"[a-z\u0600-\u06FF]", text):
        return ["out_of_scope"]
    if _contains_any(text, NON_DERM_EMERGENCY_TERMS):
        return ["non_derm_emergency"]

    intents: list[str] = []
    if _contains_any(text, CONTAGION_TRANSMISSION_TERMS):
        intents.append("contagion_transmission")
    if _contains_any(text, DIAGNOSIS_RESULT_TERMS):
        intents.append("diagnosis_result")
    if _contains_any(text, DIAGNOSIS_CONFIRMATION_TERMS):
        intents.append("diagnosis_confirmation")
    if _contains_any(text, DOSAGE_DURATION_TERMS):
        intents.append("dosage_duration")
    if _contains_any(text, PRESCRIPTION_TERMS):
        intents.append("prescription_request")
    if _contains_any(text, URGENT_TERMS):
        intents.append("urgent_care")
    if _contains_any(text, TREATMENT_TERMS):
        intents.append("treatment")
    if _contains_any(text, SYMPTOM_TERMS):
        intents.append("symptoms")
    if _contains_any(text, CARE_TERMS):
        intents.append("prevention_care")
    if _contains_any(text, DOCTOR_QUESTION_TERMS):
        intents.append("doctor_questions")
    if _contains_any(text, AGE_GROUP_TERMS):
        intents.append("age_groups")
    if _contains_any(text, OVERVIEW_TERMS):
        if is_arabic and not _contains_any(text, ARABIC_MEDICAL_TERMS):
            intents.append("out_of_scope")
        else:
            intents.append("overview")

    out_of_scope = _contains_any(text, OUT_OF_SCOPE_TERMS)
    has_medical_intent = any(intent not in {"out_of_scope"} for intent in intents)
    if out_of_scope and not has_medical_intent:
        return ["out_of_scope"]
    if out_of_scope and has_medical_intent:
        intents.append("out_of_scope")

    if not intents:
        if is_arabic and not _contains_any(text, ARABIC_MEDICAL_TERMS):
            return ["out_of_scope"]
        intents.append("overview")

    if "doctor_questions" in intents and "urgent_care" in intents and not _contains_any(text, URGENT_RISK_TERMS):
        intents = [intent for intent in intents if intent != "urgent_care"]

    if "diagnosis_result" in intents and "overview" in intents and not _contains_any(text, OVERVIEW_EXPLAIN_TERMS):
        intents = [intent for intent in intents if intent != "overview"]
    if "urgent_care" in intents and "overview" in intents and not _contains_any(text, OVERVIEW_EXPLAIN_TERMS):
        intents = [intent for intent in intents if intent != "overview"]

    return _ordered_unique(intents)


def has_life_danger_terms(message: str) -> bool:
    """Return True when the user asks about death or life-threatening risk."""
    text = normalize_text(normalize_arabic(message))
    return _contains_any(text, URGENT_RISK_TERMS)


def _contains_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(_contains_term(text, term) for term in terms)


OVERVIEW_EXPLAIN_TERMS = (
    "explain",
    "tell me about",
    "what should i know",
    "عرفني",
    "تعرفني",
    "اشرح",
    "اشرحلي",
    "فهمني",
)


def _contains_term(text: str, term: str) -> bool:
    normalized_term = normalize_text(normalize_arabic(term))
    if not normalized_term:
        return False
    if normalized_term == "الم":
        return re.search(r"(?<![a-z0-9\u0600-\u06FF])الم(?![a-z0-9\u0600-\u06FF])", text) is not None
    return normalized_term in text


def _ordered_unique(intents: list[str]) -> list[str]:
    unique = []
    for intent in ANSWER_INTENT_ORDER:
        if intent in intents and intent not in unique:
            unique.append(intent)
    for intent in intents:
        if intent not in unique:
            unique.append(intent)
    return unique or ["overview"]
