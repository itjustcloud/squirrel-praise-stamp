import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'squirrel-praise-stamp-v1';

const EMPTY_STATE = {
  profiles: [],
  selectedProfileId: null,
  profileData: {},
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_STATE;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.profiles) || typeof parsed.profileData !== 'object') {
      return EMPTY_STATE;
    }

    return {
      profiles: parsed.profiles,
      selectedProfileId: parsed.selectedProfileId ?? parsed.profiles[0]?.id ?? null,
      profileData: parsed.profileData,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function App() {
  const [appState, setAppState] = useState(loadState);
  const [newProfileName, setNewProfileName] = useState('');
  const [memoInput, setMemoInput] = useState('');
  const [tab, setTab] = useState('stamp');

  const selectedProfile = useMemo(
    () => appState.profiles.find((profile) => profile.id === appState.selectedProfileId) ?? null,
    [appState.profiles, appState.selectedProfileId]
  );

  const selectedData = selectedProfile
    ? appState.profileData[selectedProfile.id] ?? { goal: 10, stamps: 0, history: [] }
    : null;

  const progress = selectedData ? Math.min(100, Math.round((selectedData.stamps / selectedData.goal) * 100)) : 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const addProfile = () => {
    const trimmed = newProfileName.trim();
    if (!trimmed) {
      return;
    }

    const id = `profile-${Date.now()}`;
    setAppState((prev) => ({
      profiles: [...prev.profiles, { id, name: trimmed, createdAt: new Date().toISOString() }],
      selectedProfileId: id,
      profileData: {
        ...prev.profileData,
        [id]: { goal: 10, stamps: 0, history: [] },
      },
    }));
    setNewProfileName('');
    setTab('stamp');
  };

  const selectProfile = (id) => {
    setAppState((prev) => ({ ...prev, selectedProfileId: id }));
  };

  const updateGoal = (goal) => {
    if (!selectedProfile) {
      return;
    }

    setAppState((prev) => {
      const current = prev.profileData[selectedProfile.id] ?? { goal: 10, stamps: 0, history: [] };
      return {
        ...prev,
        profileData: {
          ...prev.profileData,
          [selectedProfile.id]: {
            ...current,
            goal,
            stamps: Math.min(current.stamps, goal),
          },
        },
      };
    });
  };

  const addStamp = () => {
    if (!selectedProfile || !selectedData || selectedData.stamps >= selectedData.goal) {
      return;
    }

    const memo = memoInput.trim() || '오늘도 꾸준히 해냈어요!';
    const historyEntry = {
      id: `log-${Date.now()}`,
      memo,
      date: new Date().toISOString(),
    };

    setAppState((prev) => {
      const current = prev.profileData[selectedProfile.id] ?? { goal: 10, stamps: 0, history: [] };
      return {
        ...prev,
        profileData: {
          ...prev.profileData,
          [selectedProfile.id]: {
            ...current,
            stamps: Math.min(current.goal, current.stamps + 1),
            history: [historyEntry, ...(current.history ?? [])],
          },
        },
      };
    });

    setMemoInput('');
  };

  const resetSelectedProgress = () => {
    if (!selectedProfile) {
      return;
    }

    setAppState((prev) => {
      const current = prev.profileData[selectedProfile.id] ?? { goal: 10, stamps: 0, history: [] };
      return {
        ...prev,
        profileData: {
          ...prev.profileData,
          [selectedProfile.id]: {
            ...current,
            stamps: 0,
            history: [],
          },
        },
      };
    });
  };

  const removeSelectedProfile = () => {
    if (!selectedProfile) {
      return;
    }

    setAppState((prev) => {
      const nextProfiles = prev.profiles.filter((item) => item.id !== selectedProfile.id);
      const nextProfileData = { ...prev.profileData };
      delete nextProfileData[selectedProfile.id];
      return {
        profiles: nextProfiles,
        selectedProfileId: nextProfiles[0]?.id ?? null,
        profileData: nextProfileData,
      };
    });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-10 pt-6 text-acorn-900">
      <header className="rounded-3xl border border-acorn-200 bg-white/70 p-4 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-700">Squirrel Praise Stamp</p>
        <h1 className="mt-1 text-2xl font-black">다람쥐 칭찬도장</h1>
        <p className="mt-1 text-sm text-acorn-700">작은 실천 하나마다 도토리 도장 하나씩!</p>
      </header>

      <section className="mt-4 rounded-2xl border border-acorn-200 bg-white/75 p-4">
        <h2 className="text-sm font-bold">프로필</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addProfile();
              }
            }}
            placeholder="예: 민지"
            className="w-full rounded-xl border border-acorn-300 bg-white px-3 py-2 text-sm outline-none ring-acorn-300 focus:ring-2"
          />
          <button
            onClick={addProfile}
            className="rounded-xl bg-leaf-500 px-3 py-2 text-sm font-bold text-white shadow hover:bg-leaf-700"
          >
            추가
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {appState.profiles.length === 0 && <p className="text-sm text-acorn-700">먼저 프로필을 추가해 주세요.</p>}
          {appState.profiles.map((profile) => {
            const active = profile.id === selectedProfile?.id;
            return (
              <button
                key={profile.id}
                onClick={() => selectProfile(profile.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'border-leaf-700 bg-leaf-100 text-leaf-700'
                    : 'border-acorn-300 bg-acorn-50 text-acorn-800 hover:border-acorn-500'
                }`}
              >
                {active ? '🐿️ ' : ''}
                {profile.name}
              </button>
            );
          })}
        </div>
      </section>

      <nav className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-acorn-200 bg-white/70 p-2">
        {[
          { id: 'stamp', label: '도장판' },
          { id: 'settings', label: '설정' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-xl py-2 text-sm font-bold ${
              tab === item.id ? 'bg-acorn-500 text-white' : 'bg-acorn-100 text-acorn-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'stamp' && (
        <main className="mt-4 space-y-4">
          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">{selectedProfile ? `${selectedProfile.name}의 도토리판` : '도토리판'}</h2>
              <select
                disabled={!selectedData}
                value={selectedData?.goal ?? 10}
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
            <p className="mt-2 text-sm font-semibold text-acorn-700">진행률 {progress}% ({selectedData?.stamps ?? 0}/{selectedData?.goal ?? 0})</p>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: selectedData?.goal ?? 10 }, (_, index) => {
                const filled = selectedData && index < selectedData.stamps;
                return (
                  <div
                    key={index}
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
                placeholder="메모 (선택)"
                className="w-full rounded-xl border border-acorn-300 bg-white px-3 py-2 text-sm outline-none ring-acorn-300 focus:ring-2"
              />
              <button
                onClick={addStamp}
                disabled={!selectedData || selectedData.stamps >= selectedData.goal}
                className="rounded-xl bg-acorn-500 px-3 py-2 text-sm font-black text-white shadow disabled:cursor-not-allowed disabled:bg-acorn-300"
              >
                +1 도장
              </button>
            </div>

            {selectedData && selectedData.stamps >= selectedData.goal && (
              <p className="mt-3 rounded-xl bg-leaf-100 px-3 py-2 text-sm font-bold text-leaf-700">
                🎉 목표 완료! 다람쥐가 도토리 보상을 준비했어요!
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4">
            <h3 className="text-sm font-black">최근 기록</h3>
            <ul className="mt-2 space-y-2">
              {(selectedData?.history ?? []).slice(0, 8).map((item) => (
                <li key={item.id} className="rounded-xl border border-acorn-200 bg-acorn-50 px-3 py-2 text-sm">
                  <p className="font-semibold">{formatDate(new Date(item.date))}</p>
                  <p className="mt-1 text-acorn-700">{item.memo}</p>
                </li>
              ))}
              {selectedData && selectedData.history.length === 0 && <li className="text-sm text-acorn-700">기록이 아직 없어요.</li>}
            </ul>
          </section>
        </main>
      )}

      {tab === 'settings' && (
        <main className="mt-4 space-y-4">
          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4">
            <h2 className="text-base font-black">설정</h2>
            <p className="mt-1 text-sm text-acorn-700">현재 선택: {selectedProfile ? selectedProfile.name : '없음'}</p>
            <div className="mt-3 grid gap-2">
              <button
                onClick={resetSelectedProgress}
                disabled={!selectedProfile}
                className="rounded-xl border border-acorn-400 px-3 py-2 text-sm font-bold text-acorn-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                현재 프로필 도장/기록 초기화
              </button>
              <button
                onClick={removeSelectedProfile}
                disabled={!selectedProfile}
                className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                현재 프로필 삭제
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-acorn-200 bg-white/80 p-4 text-sm text-acorn-700">
            <p>저장 방식: 브라우저 localStorage</p>
            <p className="mt-1">기기/브라우저를 바꾸면 데이터가 자동 이전되지 않아요.</p>
          </section>
        </main>
      )}
    </div>
  );
}
