// =====================================================
// 보안 주의사항:
// 1. 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출될 수 있습니다.
// 2. Gemini API 호출은 이 Vercel Serverless Function에서만 처리합니다.
// 3. .env 파일은 절대 GitHub에 올리지 않습니다.
// 4. Vercel 배포 시 Project Settings > Environment Variables에
//    GEMINI_API_KEY를 등록해야 합니다.
// 5. Gemini로 전송하는 데이터는 이름, 학번, 사진 경로를 제외한
//    최소 정보로 제한합니다.
// =====================================================

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // 환경 변수에서 API 키 읽기 (코드 안에 키를 직접 적지 않음)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.",
    });
  }

  // 요청 body 파싱
  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body;

  // 필수 값 검증
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({
      success: false,
      error: "studentAlias, gradeSummary, learningTraits, teacherConcern 값이 모두 필요합니다.",
    });
  }

  // Gemini에게 보낼 프롬프트 구성
  // 학생 이름/학번/사진 경로는 포함하지 않습니다.
  const prompt = `당신은 경험이 풍부한 교육 상담 전문가입니다.
교사가 특정 학생의 데이터를 공유하며 상담 전략을 요청했습니다.

[학생 정보 (익명화)]
- 학생 별칭: ${studentAlias}
- 성적 요약: ${gradeSummary}
- 학습 특성 요약: ${learningTraits}

[교사의 상담 고민]
${teacherConcern}

위 정보를 바탕으로 교사가 학생을 이해하고 대화할 수 있도록 돕는 상담 전략을 제안해주세요.

반드시 다음 형식으로 응답해주세요:

**1. 현재 상황 요약**
(교사의 고민과 학생 데이터를 종합한 상황 요약)

**2. 학생 데이터 기반 해석**
(성적 및 학습 특성 데이터에서 읽을 수 있는 점, 단 단정적 진단은 피할 것)

**3. 상담 접근 전략**
(구체적이고 실천 가능한 상담 방법 제안)

**4. 교사가 던질 수 있는 질문 3가지**
1) 
2) 
3) 

**5. 피해야 할 말 또는 주의점**
(상담 시 피해야 할 표현이나 태도)

**6. 다음 수업에서 해볼 수 있는 작은 지원**
(즉시 실천 가능한 소규모 지원 방법)

주의: 학생을 단정적으로 판단하거나 진단하지 마세요. "의지가 부족하다", "주의력 문제가 있다", "심리적 문제가 있다"처럼 단정하는 표현을 피하고, 교사가 학생을 이해하고 대화할 수 있도록 돕는 방향으로 응답하세요.`;

  try {
    // Node.js 내장 fetch로 Gemini REST API 직접 호출 (SDK 미사용)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({
        success: false,
        error: `Gemini API 오류 (${geminiRes.status}): ${errText}`,
      });
    }

    const data = await geminiRes.json();
    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "응답을 받지 못했습니다.";

    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `서버 오류: ${err.message}`,
    });
  }
}
