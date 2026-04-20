import { useEffect, useMemo, useState } from 'react';
import { onValue, ref, runTransaction } from 'firebase/database';
import { db, STATE_PATH } from './firebaseClient';

const ADMIN_PASSWORD = '1234';
const SESSION_KEY = 'squirrel-admin-unlocked';

const DEFAULT_BOARDS = [
  { id: 'habit', name: '습관', goal: 10, stamps: 0, history: [] },
  { id: 'study', name: '학습', goal: 10, stamps: 0, history: [] },
  { id: 'attitude', name: '태도', goal: 10, stamps: 0, history: [] },
  { id: 'health', name: '건강', goal: 10, stamps: 0, history: [] },
];

const DEFAULT_STATE = {
  userName: '다람쥐',
  boards: DEFAULT_BOARDS,
  updatedAt: null,
};

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [selectedBoardId, setSelectedBoardId] = useState(DEFAULT_BOARDS[0].id);
  const [memoInput, setMemoInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [adminError, setAdminError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stateRef = ref(db, STATE_PATH);
    const unsub = onValue(stateRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        await runTransaction(stateRef, () => DEFAULT_STATE);
        return;
      }
      setState({
        userName: data.userName || '다람쥐',
        boards: Array.isArray(data.boards) && data.boards.length > 0 ? data.boards : DEFAULT_BOARDS,
        updatedAt: data.updatedAt || null,
      });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const selectedBoard = useMemo(
    () => state.boards.find((b) => b.id === selectedBoardId) ?? state.boards[0],
    [state.boards, selectedBoardId]
  );

  useEffect(() => {
    if (selectedBoard) setSelectedBoardId(selectedBoard.id);
  }, [selectedBoard?.id]);

  const unlockAdmin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAdminError('');
      setPasswordInput('');
      return;
    }
    setAdminError('비밀번호가 맞지 않습니다.');
  };

  const updateGoal = async (goal) => {
    if (!selectedBoard) return;

    await runTransaction(ref(db, STATE_PATH), (current) => {
      const base = current || DEFAULT_STATE;
      const boards = (base.boards || []).map((b) => {
        if (b.id !== selectedBoard.id) return b;
        return { ...b, goal, stamps: Math.min(b.stamps || 0, goal) };
      });
      return {
        ...base,
        boards,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const addStamp = async () => {
    if (!selectedBoard || !isAdminUnlocked) return;

    const memo = memoInput.trim() || '오늘도 칭찬!';

    await runTransaction(ref(db, STATE_PATH), (current) => {
      const base = current || DEFAULT_STATE;
      const boards = (base.boards || []).map((b) => {
        if (b.id !== selectedBoard.id) return b;
        if ((b.stamps || 0) >= (b.goal || 10)) return b;

        const entry = {
          id: `log-${Date.now()}`,
          memo,
          createdAt: new Date().toISOString(),
        };

        return {
          ...b,
          stamps: (b.stamps || 0) + 1,
          history: [entry, ...(b.history || [])],
        };
      });

      return {
        ...base,
        boards,
        updatedAt: new Date().toISOString(),
      };
    });

    setMemoInput('');
  };

  if (loading) {
    return <div className="mx-auto min-h-screen w-full max-w-md px-4 py-10 text-center">불러오는 중...</div>;
  }

  const progress = selectedBoard ? Math.min(100, Math.round(((selectedBoard.stamps || 0) / (selectedBoard.goal || 10)) * 100)) : 0;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-10 pt-6 text-acorn-900">
      <header className="rounded-3xl border border-acorn-200 bg-white/70 p-4 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-700">Squirrel Praise Stamp</p>
        <h1 className="mt-1 text-2xl font-black">🐿️ 다람쥐 칭찬도장</h1>
      </header>

      <section className="mt-4 rounded-2xl border border-acorn-200 bg-white/80 p-4">
        <h2 className="text-sm font-bold">도장 종류</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.boards.map((board) => (
            <button
              key={board.id}
              onClick={() => setSelectedBoardId(board.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                board.id === selectedBoard?.id
                  ? 'border-leaf-700 bg-leaf-100 text-leaf-700'
                  : 'border-acorn-300 bg-acorn-50 text-acorn-800'
              }`}
            >
              {board.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-acorn-200 bg-white/80 p-4">
        <h2 className="text-sm font-bold">관리자 인증 (칭찬 등록용)</h2>
        {!isAdminUnlocked ? (
          <div className="mt-2 flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlockAdmin()}
              placeholder="비밀번호 입력"
              className="w-full rounded-xl border border-acorn-300 bg-white px-3 py-2 text-sm"
            />
            <button onClick={unlockAdmin} className="rounded-xl bg-acorn-500 px-3 py-2 text-sm font-bold text-white">
              확인
            </button>
          </div>
        ) : (
          <p className="mt-2 rounded-lg bg-leaf-100 px-3 py-2 text-sm font-semibold text-leaf-700">관리자 인증 완료</p>
        )}
        {adminError && <p className="mt-2 text-sm text-red-600">{adminError}</p>}
      </section>

      {selectedBoard && (
        <main className="mt-4 space-y-4">
          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">{selectedBoard.name} 도장판</h2>
              <select
                value={selectedBoard.goal || 10}
                onChange={(e) => updateGoal(Number(e.target.value))}
                className="rounded-lg border border-acorn-300 bg-white px-2 py-1 text-sm font-semibold"
              >
                <option value={10}>목표 10개</option>
                <option value={20}>목표 20개</option>
              </select>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-acorn-100">
              <div className="h-full bg-leaf-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-acorn-700">
              진행률 {progress}% ({selectedBoard.stamps || 0}/{selectedBoard.goal || 10})
            </p>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: selectedBoard.goal || 10 }, (_, i) => {
                const filled = i < (selectedBoard.stamps || 0);
                return (
                  <div
                    key={i}
                    className={`stamp-cell flex aspect-square items-center justify-center rounded-xl border text-xl ${
                      filled ? 'border-acorn-500' : 'border-acorn-200 opacity-45'
                    }`}
                  >
                    {filled ? '🌰' : '·'}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                placeholder="칭찬 메모 (선택)"
                className="w-full rounded-xl border border-acorn-300 bg-white px-3 py-2 text-sm"
              />
              <button
                onClick={addStamp}
                disabled={!isAdminUnlocked || (selectedBoard.stamps || 0) >= (selectedBoard.goal || 10)}
                className="rounded-xl bg-acorn-500 px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-acorn-300"
              >
                +1 도장
              </button>
            </div>

            {!isAdminUnlocked && <p className="mt-2 text-xs text-acorn-700">도장 등록은 관리자 인증 후 가능합니다.</p>}
          </section>

          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4">
            <h3 className="text-sm font-black">칭찬 기록(날짜 포함)</h3>
            <ul className="mt-2 space-y-2">
              {(selectedBoard.history || []).slice(0, 20).map((item) => (
                <li key={item.id} className="rounded-xl border border-acorn-200 bg-acorn-50 px-3 py-2 text-sm">
                  <p className="font-semibold">{formatDate(item.createdAt)}</p>
                  <p className="mt-1 text-acorn-700">{item.memo}</p>
                </li>
              ))}
              {(selectedBoard.history || []).length === 0 && <li className="text-sm text-acorn-700">기록이 아직 없어요.</li>}
            </ul>
          </section>
        </main>
      )}
    </div>
  );
}
