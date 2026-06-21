"""Safe local answer generator for retrieved RAG context."""
from __future__ import annotations

import re

from app.infrastructure.rag.disease_profiles import (
    DiseaseProfile,
    canonical_display_name,
    contains_alias,
    get_profile,
    get_safety_facts,
    has_strong_treatment,
    has_treatment_content,
)
from app.infrastructure.rag.vector_store import SearchResult


EN_FALLBACKS = {
    "urticaria": {
        "overview": "Urticaria usually means itchy, raised welts or hives that can appear and fade quickly.",
        "symptoms": ["Raised itchy welts or hives", "Burning or stinging", "Possible swelling of lips, face, eyelids, hands, or feet"],
        "care": ["Try to identify and avoid triggers", "Keep a symptom and trigger diary", "Avoid hot baths if they worsen symptoms"],
        "urgent": ["Difficulty breathing", "Swelling of the throat or tongue", "Dizziness, fainting, or signs of a severe allergic reaction"],
    },
    "psoriasis": {
        "overview": "Psoriasis is a chronic inflammatory skin condition that can cause recurring scaly plaques.",
        "symptoms": ["Red plaques with silvery scales", "Dry or cracked skin", "Itching or burning", "Possible nail or joint involvement"],
        "care": ["Moisturize daily", "Avoid scratching and personal triggers", "Ask a dermatologist about joint symptoms"],
        "urgent": ["Whole-body redness", "Severe pain with fever", "Pustular lesions with systemic symptoms"],
    },
    "tinea": {
        "overview": "Tinea is a contagious fungal skin infection that may appear as a ring-shaped rash.",
        "symptoms": ["Ring-shaped rash with raised edges", "Itching or irritation", "Scaling or dryness", "Possible central clearing"],
        "care": ["Keep the area clean and dry", "Avoid sharing towels or clothing", "Wash contaminated clothing and linens"],
        "urgent": ["Spreading rash despite care", "Scalp involvement", "Pain, pus, or signs of infection"],
    },
    "lichen": {
        "overview": "Lichen planus is an immune-mediated inflammatory skin condition that can affect skin or mucous membranes.",
        "symptoms": ["Purple flat-topped bumps", "Itching", "Fine white lines on lesions", "Possible oral or nail involvement"],
        "care": ["Avoid scratching and trauma", "Maintain oral hygiene if mouth lesions exist", "Keep dermatology follow-up"],
        "urgent": ["Painful oral ulcers that prevent eating or drinking", "Rapid worsening", "Bleeding, erosions, or infection"],
    },
    "mf": {
        "overview": "Mycosis fungoides is a rare cutaneous T-cell lymphoma that needs specialist dermatology evaluation.",
        "symptoms": ["Persistent itchy patches", "Scaly or thickened plaques", "Skin tumors or ulceration in advanced cases"],
        "care": ["Do not self-diagnose", "Keep regular specialist follow-up", "Report new or worsening symptoms promptly"],
        "urgent": ["Rapidly worsening lesions", "Bleeding or ulceration", "Fever, night sweats, weight loss, or enlarged lymph nodes"],
    },
    "healthy": {
        "overview": "A healthy result means the image did not clearly match one of the supported disease classes.",
        "symptoms": ["No clear supported disease pattern was detected", "Skin may appear even without obvious inflammation"],
        "care": ["Continue gentle skin care", "Use sun protection", "Monitor new or changing spots"],
        "urgent": ["A spot that grows, changes color, bleeds, becomes painful, or causes concern"],
    },
}

AR_FALLBACKS = {
    "urticaria": {
        "overview": "الشرى أو الأرتيكاريا غالبًا يظهر على شكل انتفاخات أو بقع مرتفعة ومثيرة للحكة قد تظهر وتختفي بسرعة.",
        "symptoms": ["انتفاخات أو بقع مرتفعة ومثيرة للحكة", "حرقان أو لسع في الجلد", "تورم محتمل في الشفاه أو الوجه أو الجفون أو اليدين أو القدمين"],
        "care": ["حاول تحديد المحفزات وتجنبها", "احتفظ بملاحظات عن الأعراض والمحفزات المحتملة", "تجنب الحمامات الساخنة إذا كانت تزيد الأعراض"],
        "urgent": ["صعوبة في التنفس", "تورم في الحلق أو اللسان", "دوخة أو إغماء أو علامات تفاعل تحسسي شديد"],
    },
    "psoriasis": {
        "overview": "الصدفية حالة جلدية التهابية مزمنة قد تسبب لويحات متقشرة ومتكررة.",
        "symptoms": ["لويحات حمراء مع قشور فضية", "جفاف أو تشقق في الجلد", "حكة أو حرقان", "احتمال تأثر الأظافر أو المفاصل"],
        "care": ["استخدم المرطبات بانتظام", "تجنب الحك والمحفزات الشخصية", "راجع طبيب الجلدية إذا ظهرت آلام في المفاصل"],
        "urgent": ["احمرار معظم الجسم", "ألم شديد مع حمى", "بثور صديدية مع أعراض عامة"],
    },
    "tinea": {
        "overview": "التينيا الحلقية عدوى فطرية معدية قد تظهر كطفح جلدي دائري أو حلقي.",
        "symptoms": ["طفح حلقي بحواف مرتفعة", "حكة أو تهيج", "قشور أو جفاف", "تفتيح محتمل في منتصف البقعة"],
        "care": ["حافظ على نظافة وجفاف المنطقة", "تجنب مشاركة المناشف أو الملابس", "اغسل الملابس والمفارش التي قد تكون ملوثة"],
        "urgent": ["انتشار الطفح رغم العناية", "إصابة فروة الرأس", "ألم أو صديد أو علامات عدوى"],
    },
    "lichen": {
        "overview": "الحزاز المسطح حالة التهابية مناعية قد تصيب الجلد أو الأغشية المخاطية.",
        "symptoms": ["حبيبات بنفسجية مسطحة", "حكة", "خطوط بيضاء دقيقة على الآفات", "احتمال إصابة الفم أو الأظافر"],
        "care": ["تجنب الحك وجرح الآفات", "حافظ على نظافة الفم إذا وُجدت آفات فموية", "تابع مع طبيب الجلدية بانتظام"],
        "urgent": ["قرح فموية مؤلمة تمنع الأكل أو الشرب", "تدهور سريع في الآفات", "نزيف أو تآكلات أو علامات عدوى"],
    },
    "mf": {
        "overview": "الفطار الفطراني نوع نادر من اللمفوما الجلدية ويحتاج إلى تقييم ومتابعة متخصصة.",
        "symptoms": ["بقع جلدية مستمرة ومثيرة للحكة", "لويحات متقشرة أو سميكة", "تقرحات أو كتل جلدية في المراحل المتقدمة"],
        "care": ["لا تعتمد على التشخيص الذاتي", "حافظ على المتابعة المنتظمة مع المختص", "أبلغ الطبيب عن أي أعراض جديدة أو متفاقمة"],
        "urgent": ["تدهور سريع في الآفات", "نزيف أو تقرح", "حمى أو تعرق ليلي أو فقدان وزن أو تضخم في العقد الليمفاوية"],
    },
    "healthy": {
        "overview": "نتيجة البشرة السليمة تعني أن الصورة لم تُظهر نمطًا واضحًا لإحدى الحالات الجلدية المدعومة.",
        "symptoms": ["لم يتم رصد نمط مرضي واضح ضمن الحالات المدعومة", "قد يبدو الجلد متوازنًا دون التهاب واضح"],
        "care": ["استمر في العناية اللطيفة بالبشرة", "استخدم واقي الشمس", "راقب أي بقع جديدة أو متغيرة"],
        "urgent": ["بقعة تكبر أو يتغير لونها أو تنزف أو تصبح مؤلمة أو تثير القلق"],
    },
}

AR_ITEM_TRANSLATIONS = {
    "topical potent steroid": "كورتيزون موضعي قوي",
    "antihistamines": "مضادات الهيستامين",
    "screening for hepatitis c": "فحص التهاب الكبد سي",
    "methotrexate": "ميثوتريكسات",
    "folic acid": "حمض الفوليك",
    "pulse dose systemic prednisolone": "جرعات نبضية من بريدنيزولون جهازي",
    "phototherapy": "العلاج الضوئي",
    "refer to oncology": "الإحالة إلى طبيب الأورام",
    "nuclear scan": "فحص نووي",
    "chemotherapy": "العلاج الكيميائي",
    "topical steroids with vitamin d": "كورتيزون موضعي مع فيتامين د",
    "keratolytics": "مقشرات أو مذيبات للطبقة القرنية",
    "emollients": "مرطبات الجلد",
    "biological treatment": "علاج بيولوجي",
    "ketoconazole shampoo": "شامبو كيتوكونازول",
    "antifungal topical treatment": "علاج موضعي مضاد للفطريات",
    "stop exposure to antigen": "إيقاف التعرض للمحفز أو المسبب المحتمل",
    "soothing agents": "مهدئات موضعية للأعراض",
}


class Generator:
    """Generate conservative sectioned answers without requiring an LLM key."""

    def generate(
        self,
        message: str,
        predicted_label: str | None,
        chunks: list[SearchResult],
        language: str = "en",
        intent: str = "overview",
        intents: list[str] | None = None,
        confidence: float | None = None,
    ) -> str:
        profile = get_profile(predicted_label)
        selected_intents = self._normalize_intents(intent, intents)

        if len(selected_intents) > 1 or self._has_mixed_scope(selected_intents):
            return self._compound_answer(
                language=language,
                profile=profile,
                predicted_label=predicted_label,
                confidence=confidence,
                chunks=chunks,
                intents=selected_intents,
            )

        if intent == "out_of_scope":
            return self._out_of_scope_message(language)
        if intent == "non_derm_emergency":
            return self._non_derm_emergency_message(language)
        if intent == "diagnosis_result":
            return self._diagnosis_result_message(language, profile, predicted_label, confidence, chunks)
        if intent == "diagnosis_confirmation":
            return self._diagnosis_confirmation_message(language, profile, predicted_label, confidence)
        if intent == "dosage_duration":
            return self._dosage_duration_message(language)
        if intent == "unclear_medical":
            return self._unclear_medical_message(language)
        if intent == "doctor_questions":
            return self._doctor_questions_message(language, profile)
        if intent == "age_groups":
            return self._age_groups_message(language, profile)
        if intent == "contagion_transmission":
            return self._contagion_transmission_answer(language, profile, self._empty_material(), chunks)
        if intent == "urgent_care":
            return self._urgent_answer(language, profile, self._empty_material())

        if profile and profile.key == "healthy":
            return self._healthy_answer(language, profile, intent)

        if not chunks:
            if intent == "prescription_request":
                return self._prescription_message(language)
            return self.insufficient_context(language)

        if profile and not self._context_matches_profile(chunks, profile):
            return self.insufficient_context(language)

        material = self._collect_material(chunks)
        if not any(material.values()):
            if intent == "prescription_request":
                return self._prescription_message(language)
            return self.insufficient_context(language)

        if language == "ar":
            answer = self._format_ar_by_intent(profile, material, intent)
        else:
            answer = self._format_en_by_intent(profile, predicted_label, material, intent)
        return self._apply_safety_note(answer, language)

    def insufficient_context(self, language: str = "en") -> str:
        if language == "ar":
            return (
                "لا تحتوي قاعدة المعرفة على معلومات كافية مرتبطة بهذه الحالة للإجابة بثقة على هذا السؤال. "
                "يرجى مراجعة طبيب جلدية للحصول على تقييم طبي مناسب."
            )
        return (
            "The knowledge base does not contain enough diagnosis-specific information to answer this question reliably. "
            "Please consult a dermatologist for medical evaluation."
        )

    def _compound_answer(
        self,
        *,
        language: str,
        profile: DiseaseProfile | None,
        predicted_label: str | None,
        confidence: float | None,
        chunks: list[SearchResult],
        intents: list[str],
    ) -> str:
        material = self._material_for_profile(chunks, profile)
        parts: list[str] = []

        if "diagnosis_result" in intents or "diagnosis_confirmation" in intents:
            parts.append(self._diagnosis_compound_fragment(language, profile, predicted_label, confidence))

        if "overview" in intents:
            parts.append(self._overview_compound_fragment(language, profile, chunks))

        if "contagion_transmission" in intents:
            parts.append(self._sentence(self._contagion_transmission_answer(language, profile, material, chunks)))

        if "symptoms" in intents:
            parts.append(self._symptoms_compound_fragment(language, profile, material))

        if "treatment" in intents or "prescription_request" in intents:
            parts.append(self._treatment_compound_fragment(language, profile, material, prescription_request="prescription_request" in intents))

        if "dosage_duration" in intents:
            parts.append(self._dosage_duration_message(language))

        if "urgent_care" in intents:
            parts.append(self._urgent_compound_fragment(language, profile, material))

        if "prevention_care" in intents:
            parts.append(self._care_compound_fragment(language, profile, material))

        if "doctor_questions" in intents:
            parts.append(self._doctor_questions_message(language, profile))

        if "age_groups" in intents:
            parts.append(self._age_groups_message(language, profile))

        if "out_of_scope" in intents:
            parts.append(self._mixed_out_of_scope_note(language))

        clean_parts = [part for part in (self._sentence(part) for part in parts) if part]
        if not clean_parts:
            return self.insufficient_context(language)
        return " ".join(clean_parts)

    def _material_for_profile(self, chunks: list[SearchResult], profile: DiseaseProfile | None) -> dict[str, list[str]]:
        empty = self._empty_material()
        if not chunks:
            return empty
        if profile and not self._context_matches_profile(chunks, profile):
            return empty
        return self._collect_material(chunks)

    def _empty_material(self) -> dict[str, list[str]]:
        return {"overview": [], "symptoms": [], "care": [], "treatment": [], "urgent": [], "transmission": []}

    def _diagnosis_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        predicted_label: str | None,
        confidence: float | None,
    ) -> str:
        if not predicted_label:
            return (
                "سياق التشخيص المحدد غير مكتمل."
                if language == "ar"
                else "The selected diagnosis context is incomplete."
            )

        confidence_text = ""
        if confidence is not None:
            confidence_percent = confidence * 100 if confidence <= 1 else confidence
            confidence_text = (
                f"، بنسبة ثقة تقريبًا {confidence_percent:.1f}%"
                if language == "ar"
                else f", with confidence around {confidence_percent:.1f}%"
            )

        label_en = canonical_display_name(predicted_label, "en")
        label_ar = canonical_display_name(predicted_label, "ar")
        if language == "ar":
            return f"التشخيص الظاهر في التقرير هو: {label_ar}{confidence_text}. هذه نتيجة مبدئية من نموذج ذكاء اصطناعي وليست تشخيصًا طبيًا نهائيًا."
        return f"The diagnosis shown in the report is: {label_en}{confidence_text}. This is a preliminary AI result, not a final medical diagnosis."

    def _overview_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        chunks: list[SearchResult],
    ) -> str:
        explanation = self._diagnosis_simple_explanation(language, profile, chunks)
        if language == "ar":
            return f"ببساطة: {explanation}"
        return f"In simple terms: {explanation}"

    def _symptoms_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {}) if language == "ar" else EN_FALLBACKS.get(key, {})
        if language == "ar":
            symptoms = fallback.get("symptoms") or self._translated_or_fallback(material["symptoms"], [], "symptoms")
            return f"الأعراض الشائعة قد تشمل: {self._inline_list(symptoms)}."
        symptoms = self._items(fallback.get("symptoms", []) + material["symptoms"], [], limit=5)
        return f"Common symptoms may include: {self._inline_list(symptoms)}."

    def _treatment_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
        prescription_request: bool = False,
    ) -> str:
        if language == "ar":
            treatments = self._translated_or_fallback(material["treatment"], [], "treatment", limit=5)
            if not treatments:
                return "لا تحتوي المقاطع المسترجعة على خيارات علاجية محددة لهذا السؤال. لا تبدأ أي علاج دون استشارة طبية."
            return (
                "الخيارات العلاجية العامة المذكورة في قاعدة المعرفة قد تشمل: "
                f"{self._inline_list([self._with_supervision_note(item, 'ar') for item in treatments])}. "
                "هذا ليس وصفة شخصية، ويجب أن يحدد طبيب الجلدية العلاج المناسب."
            )

        treatments = self._items(material["treatment"], [], limit=5)
        if not treatments:
            return "The retrieved context did not include specific treatment options for this question. Do not start treatment without medical advice."
        intro = "I cannot suggest a personal medicine or dose. General treatment options mentioned in the knowledge base may include: " if prescription_request else "General treatment options mentioned in the knowledge base may include: "
        return (
            f"{intro}{self._inline_list([self._with_supervision_note(item, 'en') for item in treatments])}. "
            "These are not personal prescriptions; a dermatologist must decide what is appropriate."
        )

    def _urgent_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {}) if language == "ar" else EN_FALLBACKS.get(key, {})
        if language == "ar":
            urgent = self._urgent_items(language, profile, material, fallback)
            return f"{self._urgent_context_sentence_ar(profile)} راجع طبيب جلدية أو اطلب رعاية طبية إذا ظهر: {self._inline_list(urgent)}."
        urgent = self._urgent_items(language, profile, material, fallback)
        return f"{self._urgent_context_sentence_en(profile)} Seek medical care if you notice: {self._inline_list(urgent)}."

    def _care_compound_fragment(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {}) if language == "ar" else EN_FALLBACKS.get(key, {})
        if language == "ar":
            care = fallback.get("care") or self._translated_or_fallback(material["care"], [], "care")
            return f"للعناية العامة: {self._inline_list(care)}."
        care = self._items(fallback.get("care", []) + material["care"], [], limit=5)
        return f"For general care: {self._inline_list(care)}."

    def _mixed_out_of_scope_note(self, language: str) -> str:
        if language == "ar":
            return "أما طلبات البرمجة أو الأسئلة غير المتعلقة بالتشخيص الجلدي فهي خارج نطاق مساعد DermaVision."
        return "Coding or unrelated requests are outside the DermaVision assistant scope."

    def _normalize_intents(self, intent: str, intents: list[str] | None) -> list[str]:
        selected = [value for value in (intents or [intent]) if value]
        if not selected:
            return [intent or "overview"]
        unique = []
        for value in selected:
            if value not in unique:
                unique.append(value)
        return unique

    def _has_mixed_scope(self, intents: list[str]) -> bool:
        return "out_of_scope" in intents and len(intents) > 1

    def _format_en_by_intent(
        self,
        profile: DiseaseProfile | None,
        predicted_label: str,
        material: dict[str, list[str]],
        intent: str,
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = EN_FALLBACKS.get(key, {})
        label = profile.display_en if profile else predicted_label
        overview = self._first(material["overview"], fallback.get("overview", f"The model result was {label}."))
        symptoms = self._items(fallback.get("symptoms", []) + material["symptoms"], [], limit=5)
        care = self._items(fallback.get("care", []) + material["care"], [], limit=5)
        urgent = self._items(fallback.get("urgent", []) + material["urgent"], [], limit=5)
        treatments = self._items(material["treatment"], [], limit=8)

        if intent == "urgent_care":
            urgent = self._urgent_items("en", profile, material, fallback)
            return "\n\n".join([
                f"**Short context**\n{self._urgent_context_sentence_en(profile)}",
                f"**When to seek urgent medical care**\n{self._bullet_list(urgent)}",
                (
                    "**What to do next**\n"
                    "- Seek urgent medical care immediately if any red flag is present.\n"
                    "- Contact a dermatologist promptly if symptoms are severe, spreading, painful, infected, or not improving.\n"
                    "- Do not delay care for breathing problems, face/lip/throat swelling, fever with severe skin symptoms, pus, or rapidly worsening lesions."
                ),
            ])

        if intent in {"treatment", "prescription_request"}:
            return "\n\n".join([
                self._treatment_section_en(treatments, prescription_request=intent == "prescription_request"),
                (
                    "**Safety warnings**\n"
                    "- These are general options mentioned in the knowledge base, not a personal prescription.\n"
                    "- A dermatologist must decide what is appropriate for your case.\n"
                    "- Strong medicines or specialist treatments require medical supervision."
                ),
            ])

        if intent == "symptoms":
            return "\n\n".join([
                f"**Common symptoms or signs**\n{self._bullet_list(symptoms)}",
                f"**Concerning symptoms**\n{self._bullet_list(urgent)}",
                "If symptoms are severe, spreading, painful, infected, or affecting breathing/swallowing, seek medical care promptly.",
            ])

        if intent == "prevention_care":
            return "\n\n".join([
                f"**General care and prevention advice**\n{self._bullet_list(care)}",
                "If symptoms persist, worsen, or concern you despite basic care, review the case with a dermatologist.",
            ])

        if intent == "doctor_questions":
            return self._doctor_questions_message("en", profile)
        if intent == "age_groups":
            return self._age_groups_message("en", profile)

        return self._format_en(profile, predicted_label, material)

    def _format_ar_by_intent(
        self,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
        intent: str,
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {})
        overview = fallback.get("overview") or "تعرض النتيجة معلومات تعليمية مرتبطة بالحالة المتوقعة."
        symptoms = fallback.get("symptoms") or self._translated_or_fallback(material["symptoms"], [], "symptoms")
        care = fallback.get("care") or self._translated_or_fallback(material["care"], [], "care")
        urgent = fallback.get("urgent") or self._translated_or_fallback(material["urgent"], [], "urgent")
        treatments = self._translated_or_fallback(material["treatment"], [], "treatment", limit=8)

        if intent == "urgent_care":
            urgent = self._urgent_items("ar", profile, material, fallback)
            return "\n\n".join([
                f"**سياق مختصر**\n{self._urgent_context_sentence_ar(profile)}",
                f"**متى يجب طلب رعاية طبية عاجلة**\n{self._bullet_list(urgent)}",
                (
                    "**ما الخطوة التالية؟**\n"
                    "- اطلب رعاية طبية عاجلة فورًا إذا ظهر أي عرض خطير.\n"
                    "- تواصل مع طبيب الجلدية بسرعة إذا كانت الأعراض شديدة أو تنتشر أو مؤلمة أو بها علامات عدوى أو لا تتحسن.\n"
                    "- لا تؤجل الرعاية عند صعوبة التنفس أو تورم الوجه أو الشفاه أو الحلق أو وجود حمى مع أعراض جلدية شديدة."
                ),
            ])

        if intent in {"treatment", "prescription_request"}:
            return "\n\n".join([
                self._treatment_section_ar(treatments, prescription_request=intent == "prescription_request"),
                (
                    "**تنبيهات السلامة**\n"
                    "- هذه خيارات عامة مذكورة في قاعدة المعرفة وليست وصفة علاجية شخصية.\n"
                    "- يجب أن يحدد طبيب الجلدية العلاج المناسب لحالتك.\n"
                    "- الأدوية القوية أو العلاجات المتخصصة تستخدم فقط تحت إشراف طبي."
                ),
            ])

        if intent == "symptoms":
            return "\n\n".join([
                f"**الأعراض أو العلامات الشائعة**\n{self._bullet_list(symptoms)}",
                f"**أعراض تستدعي الانتباه**\n{self._bullet_list(urgent)}",
                "إذا كانت الأعراض شديدة أو تنتشر أو مؤلمة أو بها علامات عدوى أو تؤثر على التنفس أو البلع، اطلب رعاية طبية بسرعة.",
            ])

        if intent == "prevention_care":
            return "\n\n".join([
                f"**نصائح عامة للعناية والوقاية**\n{self._bullet_list(care)}",
                "إذا استمرت الأعراض أو ساءت أو سببت لك قلقًا رغم العناية الأساسية، راجع طبيب الجلدية.",
            ])

        if intent == "doctor_questions":
            return self._doctor_questions_message("ar", profile)
        if intent == "age_groups":
            return self._age_groups_message("ar", profile)

        return self._format_ar(profile, material)

    def _format_en(
        self,
        profile: DiseaseProfile | None,
        predicted_label: str,
        material: dict[str, list[str]],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = EN_FALLBACKS.get(key, {})
        label = profile.display_en if profile else predicted_label
        overview = self._first(material["overview"], fallback.get("overview", f"The model result was {label}."))
        symptoms = self._items(fallback.get("symptoms", []) + material["symptoms"], [], limit=5)
        care = self._items(fallback.get("care", []) + material["care"], [], limit=5)
        urgent = self._items(fallback.get("urgent", []) + material["urgent"], [], limit=5)
        treatments = self._items(material["treatment"], [], limit=8)

        return "\n\n".join([
            f"**What this result may mean**\n{overview}",
            f"**Common symptoms or signs**\n{self._bullet_list(symptoms)}",
            f"**General care advice**\n{self._bullet_list(care)}",
            self._treatment_section_en(treatments),
            f"**When to seek urgent medical care**\n{self._bullet_list(urgent)}",
        ])

    def _format_ar(
        self,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {})
        overview = fallback.get("overview") or "تعرض النتيجة معلومات تعليمية مرتبطة بالحالة المتوقعة."
        symptoms = fallback.get("symptoms") or self._translated_or_fallback(material["symptoms"], [], "symptoms")
        care = fallback.get("care") or self._translated_or_fallback(material["care"], [], "care")
        urgent = fallback.get("urgent") or self._translated_or_fallback(material["urgent"], [], "urgent")
        treatments = self._translated_or_fallback(material["treatment"], [], "treatment", limit=8)

        return "\n\n".join([
            f"**ماذا قد تعني هذه النتيجة**\n{overview}",
            f"**الأعراض أو العلامات الشائعة**\n{self._bullet_list(symptoms)}",
            f"**نصائح عامة للعناية**\n{self._bullet_list(care)}",
            self._treatment_section_ar(treatments),
            f"**متى يجب طلب رعاية طبية عاجلة**\n{self._bullet_list(urgent)}",
        ])

    def _healthy_answer(self, language: str, profile: DiseaseProfile, intent: str) -> str:
        if language == "ar":
            fallback = AR_FALLBACKS["healthy"]
            if intent == "contagion_transmission":
                return (
                    "لم يحدد التقرير حالة جلدية معدية ضمن الفئات المدعومة. "
                    "إذا كانت لديك أعراض واضحة أو طفح ينتشر، راجع طبيب الجلدية للتأكد."
                )
            if intent == "urgent_care":
                return "\n\n".join([
                    "**متى يجب طلب رعاية طبية عاجلة**",
                    self._bullet_list(fallback["urgent"]),
                    "حتى مع نتيجة بشرة سليمة، راجع طبيب الجلدية إذا كانت لديك أعراض مستمرة أو مقلقة.",
                ])
            if intent in {"treatment", "prescription_request"}:
                return "لا أستطيع اقتراح دواء شخصي أو جرعة محددة. لا يتم عرض أدوية عند ظهور نتيجة بشرة سليمة. إذا كانت لديك أعراض أو قلق، راجع طبيب الجلدية بدلًا من استخدام علاج عشوائي."
            if intent == "symptoms":
                return "\n\n".join([
                    f"**الأعراض أو العلامات الشائعة**\n{self._bullet_list(fallback['symptoms'])}",
                    "إذا كانت لديك أعراض واضحة رغم النتيجة السليمة، فهذه النتيجة لا تغني عن الفحص الطبي.",
                ])
            if intent == "prevention_care":
                return f"**نصائح عامة للعناية والوقاية**\n{self._bullet_list(fallback['care'])}"
            return "\n\n".join([
                f"**ماذا قد تعني هذه النتيجة**\n{fallback['overview']}",
                f"**الأعراض أو العلامات الشائعة**\n{self._bullet_list(fallback['symptoms'])}",
                f"**نصائح عامة للعناية**\n{self._bullet_list(fallback['care'])}",
                "**الخيارات العلاجية العامة المذكورة في قاعدة المعرفة**\nلا يتم عرض أدوية عند ظهور نتيجة بشرة سليمة. راجع طبيب الجلدية إذا كانت لديك أعراض مستمرة أو مقلقة.",
                f"**متى يجب طلب رعاية طبية عاجلة**\n{self._bullet_list(fallback['urgent'])}",
            ])

        fallback = EN_FALLBACKS["healthy"]
        if intent == "contagion_transmission":
            return (
                "The report did not identify a contagious supported skin condition. "
                "If you still have symptoms or a spreading rash, ask a dermatologist to confirm."
            )
        if intent == "urgent_care":
            return "\n\n".join([
                "**When to seek urgent medical care**",
                self._bullet_list(fallback["urgent"]),
                "Even with a healthy prediction, ask a dermatologist if symptoms persist or concern you.",
            ])
        if intent in {"treatment", "prescription_request"}:
            return "I cannot suggest a personal medicine or dose. No medicines are shown for a healthy result. If you have symptoms or concern, ask a dermatologist instead of self-treating."
        if intent == "symptoms":
            return "\n\n".join([
                f"**Common symptoms or signs**\n{self._bullet_list(fallback['symptoms'])}",
                "If you still have visible symptoms despite a healthy prediction, the result does not replace a medical exam.",
            ])
        if intent == "prevention_care":
            return f"**General care and prevention advice**\n{self._bullet_list(fallback['care'])}"
        return "\n\n".join([
            f"**What this result may mean**\n{fallback['overview']}",
            f"**Common symptoms or signs**\n{self._bullet_list(fallback['symptoms'])}",
            f"**General care advice**\n{self._bullet_list(fallback['care'])}",
            "**General treatment options mentioned in the knowledge base**\nNo medicines are shown for a healthy result. Ask a dermatologist if symptoms persist or concern you.",
            f"**When to seek urgent medical care**\n{self._bullet_list(fallback['urgent'])}",
        ])

    def _treatment_section_en(self, treatments: list[str], prescription_request: bool = False) -> str:
        if not treatments:
            if prescription_request:
                return (
                    "**General treatment options mentioned in the knowledge base**\n"
                    "I cannot suggest a personal medicine or dose, and the retrieved context did not include specific treatment options for this question. "
                    "Do not start medication without professional medical advice."
                )
            return (
                "**General treatment options mentioned in the knowledge base**\n"
                "The retrieved context did not include specific treatment options for this question. Do not start medication without professional medical advice."
            )
        safe_items = [self._with_supervision_note(item, "en") for item in treatments]
        intro = (
            "I cannot suggest a personal medicine or dose. General treatment options commonly used for this condition may include:"
            if prescription_request
            else "General treatment options commonly used for this condition may include:"
        )
        return (
            "**General treatment options mentioned in the knowledge base**\n"
            f"{intro}\n"
            f"{self._bullet_list(safe_items)}\n"
            "These are not personal prescriptions. A dermatologist must decide what is appropriate."
        )

    def _treatment_section_ar(self, treatments: list[str], prescription_request: bool = False) -> str:
        if not treatments:
            if prescription_request:
                return (
                    "**الخيارات العلاجية العامة المذكورة في قاعدة المعرفة**\n"
                    "لا أستطيع اقتراح دواء شخصي أو جرعة محددة، ولم تتضمن المقاطع المسترجعة خيارات علاجية محددة لهذا السؤال. "
                    "لا تبدأ أي دواء دون استشارة طبية."
                )
            return (
                "**الخيارات العلاجية العامة المذكورة في قاعدة المعرفة**\n"
                "لم تتضمن المقاطع المسترجعة خيارات علاجية محددة لهذا السؤال. لا تبدأ أي دواء دون استشارة طبية."
            )
        safe_items = [self._with_supervision_note(item, "ar") for item in treatments]
        intro = (
            "لا أستطيع اقتراح دواء شخصي أو جرعة محددة. لكن الخيارات العلاجية العامة الشائعة لهذه الحالة، حسب قاعدة المعرفة، قد تشمل:"
            if prescription_request
            else "لا أستطيع اقتراح دواء شخصي أو جرعة محددة. لكن الخيارات العلاجية العامة الشائعة لهذه الحالة، حسب قاعدة المعرفة، قد تشمل:"
        )
        return (
            "**الخيارات العلاجية العامة المذكورة في قاعدة المعرفة**\n"
            f"{intro}\n"
            f"{self._bullet_list(safe_items)}\n"
            "هذه ليست وصفة شخصية، ويجب أن يحدد طبيب الجلدية العلاج المناسب."
        )

    def _diagnosis_result_message(
        self,
        language: str,
        profile: DiseaseProfile | None,
        predicted_label: str | None,
        confidence: float | None,
        chunks: list[SearchResult],
    ) -> str:
        if not predicted_label or confidence is None:
            if language == "ar":
                return (
                    "سياق التشخيص المحدد غير مكتمل. يرجى فتح تقرير التشخيص مرة أخرى ثم إعادة المحاولة."
                )
            return (
                "The selected diagnosis context is incomplete. Please open the diagnosis report again and try again."
            )

        confidence_percent = confidence * 100 if confidence <= 1 else confidence
        label_en = canonical_display_name(predicted_label, "en")
        label_ar = canonical_display_name(predicted_label, "ar")
        simple_explanation = self._diagnosis_simple_explanation(language, profile, chunks)

        if language == "ar":
            return (
                f"التشخيص الظاهر في التقرير هو: {label_ar}. "
                f"نسبة الثقة تقريبًا: {confidence_percent:.1f}%. "
                "هذه نتيجة من نموذج ذكاء اصطناعي وليست تشخيصًا طبيًا نهائيًا. "
                f"الحالة تعني باختصار: {simple_explanation} "
                "ويُفضّل مراجعة طبيب جلدية للتأكيد."
            )

        return (
            f"The diagnosis shown in the report is: {label_en}, "
            f"with confidence around {confidence_percent:.1f}%. "
            "This is an AI prediction, not a final medical diagnosis. "
            f"In simple terms: {simple_explanation} "
            "A dermatologist should confirm it."
        )

    def _diagnosis_confirmation_message(
        self,
        language: str,
        profile: DiseaseProfile | None,
        predicted_label: str | None,
        confidence: float | None,
    ) -> str:
        if not predicted_label or confidence is None:
            if language == "ar":
                return "سياق التشخيص المحدد غير مكتمل. يرجى فتح تقرير التشخيص مرة أخرى ثم إعادة المحاولة."
            return "The selected diagnosis context is incomplete. Please open the diagnosis report again and try again."

        confidence_percent = confidence * 100 if confidence <= 1 else confidence
        label_en = canonical_display_name(predicted_label, "en")
        label_ar = canonical_display_name(predicted_label, "ar")

        if language == "ar":
            return (
                f"نعم، حسب تقرير الذكاء الاصطناعي، التشخيص الظاهر هو: {label_ar} "
                f"بنسبة ثقة تقريبًا {confidence_percent:.1f}%. "
                "لكن هذه نتيجة مبدئية من نموذج ذكاء اصطناعي ويجب تأكيدها مع طبيب جلدية."
            )

        return (
            f"Yes, according to the AI report, the shown diagnosis is: {label_en}, "
            f"with confidence around {confidence_percent:.1f}%. "
            "This is a preliminary AI result and should be confirmed by a dermatologist."
        )

    def _diagnosis_simple_explanation(
        self,
        language: str,
        profile: DiseaseProfile | None,
        chunks: list[SearchResult],
    ) -> str:
        key = profile.key if profile else "unknown"
        fallback = AR_FALLBACKS.get(key, {}).get("overview") if language == "ar" else EN_FALLBACKS.get(key, {}).get("overview")

        if language == "ar" and fallback:
            return fallback

        if chunks and (not profile or self._context_matches_profile(chunks, profile)):
            material = self._collect_material(chunks)
            overview = self._first(material["overview"], fallback or "")
            if overview:
                return self._short_sentence(overview)

        if fallback:
            return fallback
        if language == "ar":
            return "لا تحتوي قاعدة المعرفة على شرح كافٍ لهذه الحالة."
        return "The knowledge base does not contain enough explanation for this condition."

    def _contagion_transmission_answer(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
        chunks: list[SearchResult],
    ) -> str:
        facts = get_safety_facts(profile.display_en if profile else None)
        if facts:
            if language == "ar" and facts.contagion_ar:
                return facts.contagion_ar
            if language != "ar" and facts.contagion_en:
                return facts.contagion_en

        if profile and profile.key == "urticaria":
            if language == "ar":
                return (
                    "لا، الشرى / الأرتيكاريا نفسه ليس مرضًا معديًا ولا ينتقل باللمس أو التقبيل أو مشاركة الأدوات. "
                    "هو غالبًا تفاعل حساسية أو استجابة لمحفزات، وقد تكون العدوى المسببة أحيانًا معدية لكن الطفح الشروي نفسه لا ينتقل من شخص لآخر."
                )
            return (
                "No, urticaria/hives itself is not contagious and does not spread through touch, kissing, or shared items. "
                "It is usually a hypersensitivity or trigger reaction."
            )

        if profile and profile.key == "tinea":
            if language == "ar":
                return "نعم، التينيا الحلقية معدية لأنها عدوى فطرية. قد تنتقل بالملامسة المباشرة أو عبر المناشف أو الملابس أو الأدوات أو الأسطح الملوثة."
            return "Yes, tinea can be contagious because it is a fungal infection. It can spread through direct contact or contaminated towels, clothing, tools, or shared surfaces."

        context_text = " ".join(chunk.text.lower() for chunk in chunks)
        has_contagion_context = (
            bool(material.get("transmission"))
            or "contagious" in context_text
            or "transmission" in context_text
            or "spread" in context_text
            or "infectious" in context_text
        )
        if not has_contagion_context:
            return self.insufficient_context(language)

        if "not contagious" in context_text or "non-contagious" in context_text:
            return self._not_contagious_answer(language, profile)

        transmission = self._items(material.get("transmission", []), [], limit=5)
        if not transmission:
            return self.insufficient_context(language)

        label_ar = canonical_display_name(profile.display_en if profile else None, "ar") if profile else "الحالة المحددة"
        label_en = canonical_display_name(profile.display_en if profile else None, "en") if profile else "the selected condition"
        if language == "ar":
            return "\n\n".join([
                f"تحتوي قاعدة المعرفة على معلومات انتقال مرتبطة بـ {label_ar}.",
                f"**طرق الانتقال المذكورة**\n{self._bullet_list(transmission)}",
                "لتقليل الانتقال، اتبع إرشادات النظافة والعناية العامة وراجع طبيب الجلدية إذا كانت الأعراض تنتشر أو لا تتحسن.",
            ])
        return "\n\n".join([
            f"The knowledge base includes transmission information for {label_en}.",
            f"**Transmission details mentioned**\n{self._bullet_list(transmission)}",
            "To reduce spread, follow hygiene and care guidance and contact a dermatologist if symptoms spread or do not improve.",
        ])

    def _not_contagious_answer(self, language: str, profile: DiseaseProfile | None) -> str:
        if language == "ar":
            label = canonical_display_name(profile.display_en if profile else None, "ar") if profile else "هذه الحالة"
            return (
                f"حسب المعلومات المتاحة في قاعدة المعرفة، {label} ليست معدية. "
                "لا تنتقل عادةً من شخص لآخر بمجرد الملامسة. إذا كان هناك طفح ينتشر بسرعة أو توجد علامات عدوى، راجع طبيب الجلدية للتأكد."
            )

        label = canonical_display_name(profile.display_en if profile else None, "en") if profile else "this condition"
        return (
            f"According to the available knowledge base, {label} is not contagious. "
            "It usually does not spread from person to person through casual contact. "
            "If the rash is spreading quickly or there are signs of infection, ask a dermatologist to confirm."
        )

    def _urgent_context_sentence_en(self, profile: DiseaseProfile | None) -> str:
        facts = get_safety_facts(profile.display_en if profile else None)
        if facts and facts.danger_en:
            return facts.danger_en
        if profile and profile.key == "urticaria":
            return (
                "Urticaria is usually not life-threatening, but it can become urgent if there are signs of a severe allergic reaction or anaphylaxis."
            )
        if profile and profile.key == "tinea":
            return (
                "In most cases, tinea is not dangerous, but it is contagious and may spread if it is not treated properly."
            )
        return "For the selected diagnosis, watch for symptoms that suggest worsening disease or a serious reaction."

    def _urgent_context_sentence_ar(self, profile: DiseaseProfile | None) -> str:
        facts = get_safety_facts(profile.display_en if profile else None)
        if facts and facts.danger_ar:
            return facts.danger_ar
        if profile and profile.key == "urticaria":
            return (
                "غالبًا لا تكون الشرى / الأرتيكاريا (Urticaria) مهددة للحياة، "
                "لكن اطلب رعاية عاجلة فورًا إذا ظهرت علامات تفاعل تحسسي شديد أو صدمة تحسسية."
            )
        if profile and profile.key == "tinea":
            return "في أغلب الحالات التينيا الحلقية ليست خطيرة، لكنها معدية وقد تنتشر إذا لم تُعالج."
        return "بالنسبة للتشخيص المحدد، انتبه للأعراض التي قد تشير إلى تدهور الحالة أو تفاعل خطير."

    def _urgent_answer(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
    ) -> str:
        fallback = AR_FALLBACKS.get(profile.key if profile else "unknown", {}) if language == "ar" else EN_FALLBACKS.get(profile.key if profile else "unknown", {})
        urgent = self._urgent_items(language, profile, material, fallback)
        if language == "ar":
            return "\n\n".join([
                f"**سياق مختصر**\n{self._urgent_context_sentence_ar(profile)}",
                f"**متى يجب طلب رعاية طبية عاجلة**\n{self._bullet_list(urgent)}",
                (
                    "**ما الخطوة التالية؟**\n"
                    "- إذا ظهرت أي علامة من العلامات السابقة، اطلب طوارئ أو رعاية عاجلة فورًا.\n"
                    "- إذا كانت الأعراض شديدة أو تزداد أو لا تتحسن، راجع طبيب جلدية بسرعة."
                ),
            ])
        return "\n\n".join([
            f"**Short context**\n{self._urgent_context_sentence_en(profile)}",
            f"**When to seek urgent medical care**\n{self._bullet_list(urgent)}",
            (
                "**What to do next**\n"
                "- Seek emergency or urgent care immediately if any red flag appears.\n"
                "- Contact a dermatologist promptly if symptoms are severe, worsening, or not improving."
            ),
        ])

    def _urgent_items(
        self,
        language: str,
        profile: DiseaseProfile | None,
        material: dict[str, list[str]],
        fallback: dict[str, list[str] | str],
    ) -> list[str]:
        facts = get_safety_facts(profile.display_en if profile else None)
        if language == "ar" and facts and facts.urgent_red_flags_ar:
            return list(facts.urgent_red_flags_ar)
        if language != "ar" and facts and facts.urgent_red_flags_en:
            return list(facts.urgent_red_flags_en)
        if language == "ar":
            fallback_items = fallback.get("urgent") if isinstance(fallback.get("urgent"), list) else []
            return list(fallback_items) or self._translated_or_fallback(material.get("urgent", []), [], "urgent")
        fallback_items = fallback.get("urgent") if isinstance(fallback.get("urgent"), list) else []
        return self._items(list(fallback_items) + material.get("urgent", []), [], limit=5)

    def _doctor_questions_message(self, language: str, profile: DiseaseProfile | None) -> str:
        if language == "ar":
            label = canonical_display_name(profile.display_en if profile else None, "ar") if profile else "الحالة الظاهرة في التقرير"
            questions = [
                "ما مدى دقة التشخيص الظاهر في التقرير؟",
                "هل أحتاج فحص سريري أو تحاليل؟",
                "ما المحفزات المحتملة لحالتي؟",
                "ما العلاج المناسب ومدة المتابعة؟",
                "ما العلامات التي تستدعي الطوارئ؟",
                "هل الحالة معدية؟",
                "كيف أتجنب تكرارها أو زيادتها؟",
            ]
            return "\n".join([
                f"يمكنك سؤال طبيب الجلدية عن {label} بهذه الطريقة:",
                self._bullet_list(questions),
                "ولا تعتمد على التقرير وحده كتشخيص نهائي."
            ])

        label = canonical_display_name(profile.display_en if profile else None, "en") if profile else "the condition shown in the report"
        questions = [
            "How accurate is the diagnosis shown in the report?",
            "Do I need a clinical exam or tests?",
            "What possible triggers apply to my case?",
            "What treatment is appropriate and how should follow-up be planned?",
            "Which signs require urgent care?",
            "Is this condition contagious?",
            "How can I avoid recurrence or worsening?",
        ]
        return "\n".join([
            f"You can ask your dermatologist these questions about {label}:",
            self._bullet_list(questions),
            "The AI report is only preliminary and should not replace a medical exam."
        ])

    def _age_groups_message(self, language: str, profile: DiseaseProfile | None) -> str:
        facts = get_safety_facts(profile.display_en if profile else None)
        if language == "ar":
            if facts and facts.age_groups_ar:
                return facts.age_groups_ar
            label = canonical_display_name(profile.display_en if profile else None, "ar") if profile else "هذه الحالة"
            return (
                f"لا تحتوي قاعدة المعرفة على تفاصيل كافية عن الأعمار المرتبطة بـ {label}. "
                "إذا كان المريض طفلًا أو كبيرًا في السن، فالأفضل مراجعة طبيب جلدية أو طبيب أطفال/باطنة حسب الحالة."
            )
        if facts and facts.age_groups_en:
            return facts.age_groups_en
        label = canonical_display_name(profile.display_en if profile else None, "en") if profile else "this condition"
        return (
            f"The knowledge base does not contain enough age-specific information about {label}. "
            "If the patient is a child or an older adult, ask an appropriate clinician to review the case."
        )

    def _dosage_duration_message(self, language: str) -> str:
        if language == "ar":
            return (
                "لا أستطيع تحديد جرعة أو عدد مرات استخدام أو مدة علاج شخصية. "
                "قاعدة المعرفة تعرض خيارات علاجية عامة فقط، ولا تحتوي على تعليمات كافية لتحديد الجرعة أو المدة لحالتك. "
                "يجب أن يحدد طبيب الجلدية العلاج والجرعة والمدة المناسبة."
            )
        return (
            "I cannot determine a personal dose, frequency, or treatment duration. "
            "The knowledge base provides general treatment options only and does not contain enough information to decide the dose or duration for your case. "
            "A dermatologist must decide the correct treatment, dose, and duration."
        )

    def _unclear_medical_message(self, language: str) -> str:
        if language == "ar":
            return "هل تقصد شرح التشخيص، الأعراض، العلاج العام، العدوى، أم متى تحتاج إلى طبيب؟"
        return "Do you mean the diagnosis explanation, symptoms, treatment options, contagion, or when to see a doctor?"

    def _collect_material(self, chunks: list[SearchResult]) -> dict[str, list[str]]:
        material = {"overview": [], "symptoms": [], "care": [], "treatment": [], "urgent": [], "transmission": []}
        for chunk in chunks:
            text = self._clean_noise(chunk.text)
            for item in self._qa_treatment_items(text):
                material["treatment"].append(item)

            current_section: str | None = None
            for raw_line in text.splitlines():
                line = self._clean_item(raw_line)
                if not line:
                    continue
                section = self._section_from_line(line)
                if section:
                    if section == "__stop__":
                        current_section = None
                        continue
                    current_section = section
                    inline = self._inline_after_header(line)
                    if inline:
                        material[section].append(inline)
                    continue
                if current_section and self._is_content_line(line):
                    if current_section == "care" and has_treatment_content(line):
                        continue
                    if current_section == "treatment" and not has_treatment_content(line):
                        continue
                    material[current_section].append(line)

        return {key: self._dedupe_items(items) for key, items in material.items()}

    def _qa_treatment_items(self, text: str) -> list[str]:
        if "A:" not in text:
            return []
        items: list[str] = []
        for answer_match in re.finditer(r"A:\s*(.*?)(?=\nQ:|\n={3,}|\Z)", text, flags=re.DOTALL):
            answer = answer_match.group(1)
            if not has_treatment_content(answer):
                continue
            for line in answer.splitlines():
                item = self._clean_item(line)
                if item and has_treatment_content(item):
                    items.append(item)
        return items

    def _context_matches_profile(self, chunks: list[SearchResult], profile: DiseaseProfile) -> bool:
        return any(profile.key in chunk.disease_tags or contains_alias(chunk.text, profile) for chunk in chunks)

    def _section_from_line(self, line: str) -> str | None:
        upper_line = line.upper()
        if upper_line.startswith("OVERVIEW"):
            return "overview"
        if upper_line.startswith("KEY FACTS"):
            return "overview"
        if upper_line.startswith("SYMPTOMS"):
            return "symptoms"
        if upper_line.startswith("PATIENT MANAGEMENT ADVICE"):
            return "care"
        if upper_line.startswith("MONITORING"):
            return "care"
        if upper_line.startswith("RED FLAGS"):
            return "urgent"
        if upper_line.startswith("TRANSMISSION"):
            return "transmission"
        if upper_line.startswith("TREATMENT") or upper_line.startswith("THERAPY"):
            return "treatment"
        if upper_line.startswith(("CAUSES", "MOLECULAR", "TRIGGERS", "DIFFERENTIAL", "DIAGNOSIS", "COMPLICATIONS", "SEVERITY", "CLASSIFICATION", "TAGS")):
            return "__stop__"
        return None

    def _inline_after_header(self, line: str) -> str:
        if ":" not in line:
            return ""
        return self._clean_item(line.split(":", 1)[1])

    def _is_content_line(self, line: str) -> bool:
        upper_line = line.upper()
        blocked_prefixes = (
            "DISEASE #",
            "CLASSIFICATION:",
            "TAGS:",
            "DERMATOLOGICAL",
            "RAG-OPTIMIZED",
            "CAUSES",
            "MOLECULAR",
            "TRIGGERS",
            "DIFFERENTIAL",
            "DIAGNOSIS METHODS",
            "COMPLICATIONS",
            "SEVERITY",
        )
        return not upper_line.startswith(blocked_prefixes)

    def _clean_noise(self, text: str) -> str:
        lines = []
        for line in text.splitlines():
            if re.fullmatch(r"=+", line.strip()):
                continue
            lines.append(line)
        return "\n".join(lines)

    def _clean_item(self, line: str) -> str:
        line = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", line or "")
        line = re.sub(r"^\s*[QA]:\s*", "", line)
        line = re.sub(r"\s+", " ", line).strip(" -\t\r\n")
        if not line or re.fullmatch(r"=+", line):
            return ""
        blocked_prefixes = (
            "dermatological diseases reference",
            "rag-optimized",
            "disease #",
            "classification:",
            "tags:",
            "treatment goals",
        )
        if line.lower().startswith(blocked_prefixes):
            return ""
        if line.lower().startswith(("what is the treatment", "how should", "patient has", "suggest a treatment", "the model classified")):
            return ""
        return line

    def _items(self, items: list[str], fallback: list[str], limit: int = 5) -> list[str]:
        selected = self._dedupe_items(items)[:limit]
        if not selected:
            selected = fallback[:limit]
        return selected

    def _translated_or_fallback(
        self,
        items: list[str],
        fallback: list[str],
        category: str,
        limit: int = 5,
    ) -> list[str]:
        translated = []
        for item in self._dedupe_items(items):
            value = self._translate_ar_item(item, category)
            if value:
                translated.append(value)
            if len(translated) >= limit:
                break
        return translated or fallback[:limit]

    def _translate_ar_item(self, item: str, category: str) -> str | None:
        normalized = re.sub(r"\s+", " ", item.lower()).strip(" .؛;:")
        if normalized in AR_ITEM_TRANSLATIONS:
            return AR_ITEM_TRANSLATIONS[normalized]
        for phrase, translation in AR_ITEM_TRANSLATIONS.items():
            if phrase in normalized:
                return translation
        if not re.search(r"[a-zA-Z]", item):
            return item
        return None

    def _dedupe_items(self, items: list[str]) -> list[str]:
        selected = []
        seen = set()
        for item in items:
            cleaned = self._clean_item(item)
            if not cleaned:
                continue
            key = re.sub(r"[^a-z0-9\u0600-\u06FF]+", " ", cleaned.lower()).strip()
            if key in seen:
                continue
            seen.add(key)
            selected.append(cleaned)
        return selected

    def _first(self, items: list[str], fallback: str) -> str:
        return self._dedupe_items(items)[0] if self._dedupe_items(items) else fallback

    def _short_sentence(self, text: str, max_chars: int = 260) -> str:
        cleaned = re.sub(r"\s+", " ", text or "").strip()
        if len(cleaned) <= max_chars:
            return cleaned
        match = re.search(r"(.{80,}?[.!؟])\s", cleaned)
        if match and len(match.group(1)) <= max_chars:
            return match.group(1).strip()
        return f"{cleaned[:max_chars].rstrip()}..."

    def _bullet_list(self, items: list[str]) -> str:
        if not items:
            return "- No specific details were found in the retrieved context."
        return "\n".join(f"- {item}" for item in items)

    def _inline_list(self, items: list[str], limit: int = 5) -> str:
        selected = self._dedupe_items(items)[:limit]
        if not selected:
            return "لا توجد تفاصيل محددة" if any(re.search(r"[\u0600-\u06FF]", item or "") for item in items) else "no specific details were found"
        return "، ".join(selected)

    def _sentence(self, text: str) -> str:
        cleaned = re.sub(r"\s+", " ", (text or "").replace("\n", " ")).strip()
        return cleaned

    def _with_supervision_note(self, item: str, language: str) -> str:
        if not has_strong_treatment(item):
            return item
        if language == "ar":
            if "إشراف طبي" in item:
                return item
            return f"{item} - فقط تحت إشراف طبي"
        if "medical supervision" in item.lower():
            return item
        return f"{item} - only under medical supervision"

    def _out_of_scope_message(self, language: str) -> str:
        if language == "ar":
            return "أستطيع المساعدة فقط في الأسئلة المتعلقة بتقرير التشخيص الجلدي وقاعدة المعرفة الجلدية المتاحة."
        return "I can only help with questions related to your selected skin diagnosis and the available dermatology knowledge base."

    def _non_derm_emergency_message(self, language: str) -> str:
        if language == "ar":
            return (
                "أستطيع المساعدة فقط في الأسئلة المتعلقة بتقرير التشخيص الجلدي وقاعدة المعرفة الجلدية المتاحة. "
                "إذا كانت لديك أعراض طارئة مثل ألم الصدر أو صعوبة التنفس أو أعراض شديدة مفاجئة، اطلب رعاية طبية عاجلة فورًا."
            )
        return (
            "I can only help with questions related to your selected skin diagnosis and the available dermatology knowledge base. "
            "For emergency symptoms such as chest pain, trouble breathing, or sudden severe symptoms, seek urgent medical care immediately."
        )

    def _prescription_message(self, language: str) -> str:
        if language == "ar":
            return (
                "لا أستطيع تحديد ما إذا كان يجب عليك استخدام دواء معين أو إعطاء جرعة شخصية. "
                "هذا يحتاج إلى تقييم طبي من طبيب جلدية أو طبيب مؤهل، خاصة مع الأدوية القوية أو الكورتيزون أو العلاجات الجهازية."
            )
        return (
            "I cannot tell you whether to take a specific medicine or provide a personal dose. "
            "That requires evaluation by a dermatologist or qualified doctor, especially for strong medicines, steroids, or systemic treatments."
        )

    def _apply_safety_note(self, answer: str, language: str) -> str:
        if not has_strong_treatment(answer):
            return answer
        if language == "ar":
            if "إشراف طبي" in answer:
                return answer
            return f"{answer}\n\nتنبيه: العلاجات القوية أو المتخصصة تستخدم فقط تحت إشراف طبي."
        if "medical supervision" in answer.lower():
            return answer
        return f"{answer}\n\nImportant: Strong medications or specialist treatments are used only under medical supervision."
