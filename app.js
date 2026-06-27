const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map((s, idx) => renderStudentCard(s, idx)).join("")}
    </section>

    <!-- AI 학생 상담 전략 도우미 패널 -->
    <!-- 보안: 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출됩니다. -->
    <!-- Gemini API 호출은 /api/gemini-counseling (Vercel Serverless Function)에서만 처리합니다. -->
    <section class="ai-counseling-panel" id="aiCounselingPanel" aria-label="AI 학생 상담 전략 도우미">
      <div class="ai-panel-header">
        <div>
          <p class="eyebrow">AI Assistant</p>
          <h2 class="ai-panel-title">AI 학생 상담 전략 도우미</h2>
          <p class="ai-panel-desc">학생을 선택하고 상담 고민을 입력하면 AI가 맞춤 상담 전략을 제안합니다.</p>
        </div>
      </div>

      <div class="ai-panel-body">
        <!-- 선택된 학생 표시 -->
        <div class="ai-selected-student" id="aiSelectedStudent">
          <span class="ai-no-selection">위 학생 카드에서 <strong>상담 전략 요청</strong> 버튼을 눌러 학생을 선택하세요.</span>
        </div>

        <!-- 교사 고민 입력 -->
        <div class="ai-input-group">
          <label class="ai-label" for="teacherConcernInput">교사 상담 고민 입력</label>
          <textarea
            id="teacherConcernInput"
            class="ai-textarea"
            rows="4"
            placeholder="예) 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?
예) 과제 제출이 자주 늦습니다. 혼내기보다는 원인을 파악하고 싶은데 어떻게 접근하면 좋을까요?
예) 친구들과 협업할 때 소극적인 편입니다. 어떤 질문으로 대화를 시작하면 좋을까요?"
          ></textarea>
        </div>

        <!-- 전송 데이터 미리보기 -->
        <div class="ai-preview-box" id="aiPreviewBox">
          <p class="ai-preview-label">전송 데이터 미리보기 <span class="ai-preview-note">(학생 이름·학번·사진 제외)</span></p>
          <pre class="ai-preview-code" id="aiPreviewCode">학생을 선택하면 미리보기가 표시됩니다.</pre>
        </div>

        <!-- 버튼 + 오류 메시지 -->
        <div class="ai-action-row">
          <button class="primary-button" id="aiSubmitBtn" type="button">AI 상담 전략 받기</button>
          <p class="ai-error-msg" id="aiErrorMsg" role="alert" aria-live="polite"></p>
        </div>

        <!-- 로딩 / 결과 표시 -->
        <div class="ai-result-area" id="aiResultArea" aria-live="polite"></div>
      </div>

      <!-- 안내 문구 -->
      <p class="ai-disclaimer">
        AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </p>
    </section>
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");

  // AI 상담 패널 이벤트 연결
  initAiCounselingPanel();
}

// 익명 별칭 목록 (학생 인덱스 순서대로 A, B, C ...)
const STUDENT_ALIASES = ["학생 A", "학생 B", "학생 C"];

function renderStudentCard(student, idx) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <!-- 상담 전략 요청 버튼: 학생 index를 data 속성으로 전달 -->
        <button
          class="counsel-btn ghost-button"
          type="button"
          data-student-idx="${idx}"
          aria-label="${student.name} 학생 상담 전략 요청"
        >상담 전략 요청</button>
      </div>
    </article>
  `;
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

// =====================================================
// AI 상담 패널 초기화 함수
// 보안: Gemini API 키는 이 파일 어디에도 존재하지 않습니다.
// API 호출은 /api/gemini-counseling (서버리스 함수)을 통해서만 이루어집니다.
// .env 파일은 GitHub에 올리지 않습니다.
// Vercel 배포 시 Project Settings > Environment Variables에
// GEMINI_API_KEY를 등록해야 합니다.
// =====================================================
function initAiCounselingPanel() {
  let selectedStudentIdx = null;

  // 학생 카드의 "상담 전략 요청" 버튼 이벤트
  document.querySelectorAll(".counsel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedStudentIdx = parseInt(btn.dataset.studentIdx, 10);
      const student = STUDENTS[selectedStudentIdx];
      const alias = STUDENT_ALIASES[selectedStudentIdx] || `학생 ${selectedStudentIdx + 1}`;

      // 선택된 학생 표시 영역 업데이트
      const selectedArea = document.getElementById("aiSelectedStudent");
      selectedArea.innerHTML = `
        <div class="ai-student-chip">
          <span class="ai-chip-alias">${alias}</span>
          <span class="ai-chip-real">화면 표시: ${student.name} (학번 ${student.id})</span>
        </div>
        <p class="ai-chip-note">Gemini 전송 시 이름·학번·사진은 제외되며 <strong>${alias}</strong>로 익명화됩니다.</p>
      `;

      // 전송 데이터 미리보기 갱신
      updatePreview(student, alias);

      // 이전 결과 초기화
      document.getElementById("aiResultArea").innerHTML = "";
      document.getElementById("aiErrorMsg").textContent = "";

      // 패널로 스크롤
      document.getElementById("aiCounselingPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // 고민 입력 시 미리보기 자동 갱신
  const concernInput = document.getElementById("teacherConcernInput");
  concernInput.addEventListener("input", () => {
    if (selectedStudentIdx !== null) {
      const student = STUDENTS[selectedStudentIdx];
      const alias = STUDENT_ALIASES[selectedStudentIdx] || `학생 ${selectedStudentIdx + 1}`;
      updatePreview(student, alias);
    }
  });

  // AI 상담 전략 받기 버튼
  document.getElementById("aiSubmitBtn").addEventListener("click", async () => {
    const errorEl = document.getElementById("aiErrorMsg");
    const resultEl = document.getElementById("aiResultArea");
    const concern = document.getElementById("teacherConcernInput").value.trim();

    errorEl.textContent = "";

    if (selectedStudentIdx === null) {
      errorEl.textContent = "먼저 학생 카드에서 상담 전략 요청 버튼을 눌러 학생을 선택해주세요.";
      return;
    }

    if (!concern) {
      errorEl.textContent = "상담 고민을 먼저 입력해주세요.";
      return;
    }

    const student = STUDENTS[selectedStudentIdx];
    const alias = STUDENT_ALIASES[selectedStudentIdx] || `학생 ${selectedStudentIdx + 1}`;

    // Gemini에 보낼 익명화 데이터 구성
    // 보안: 이름, 학번, 사진 경로는 포함하지 않습니다.
    const gradeSummary = Object.entries(student.grades)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const learningTraits = [...student.traits, student.teacherMemo].join(" / ");

    // 로딩 표시
    resultEl.innerHTML = `<p class="ai-loading">AI가 상담 전략을 생성하는 중입니다...</p>`;

    try {
      // 프론트엔드는 /api/gemini-counseling 으로만 요청 (API 키 미포함)
      const res = await fetch("/api/gemini-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentAlias: alias,
          gradeSummary,
          learningTraits,
          teacherConcern: concern,
        }),
      });

      const data = await res.json();

      if (data.success) {
        resultEl.innerHTML = `
          <div class="ai-result-card">
            <p class="ai-result-label">AI 상담 전략 결과</p>
            <div class="ai-result-text">${formatAiResult(data.result)}</div>
          </div>
        `;
      } else {
        resultEl.innerHTML = "";
        errorEl.textContent = `AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요. (${data.error})`;
      }
    } catch (err) {
      resultEl.innerHTML = "";
      errorEl.textContent = "AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.";
    }
  });

  // 전송 데이터 미리보기 갱신 헬퍼
  function updatePreview(student, alias) {
    const concern = document.getElementById("teacherConcernInput").value.trim();
    const gradeSummary = Object.entries(student.grades)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const learningTraits = [...student.traits, student.teacherMemo].join(" / ");

    // 미리보기에 이름, 학번, 사진 경로 포함하지 않음
    const preview = {
      studentAlias: alias,
      gradeSummary,
      learningTraits,
      teacherConcern: concern || "(아직 입력되지 않음)",
    };

    document.getElementById("aiPreviewCode").textContent = JSON.stringify(preview, null, 2);
  }

  // Gemini 응답 텍스트를 HTML로 변환 (**굵게** 처리, 줄바꿈)
  function formatAiResult(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }
}

showOnly(loginView);
