# 다람쥐 칭찬도장

React + Vite + Tailwind로 만든 모바일 우선 칭찬 도장 웹앱입니다.

## 주요 기능
- 프로필 추가/선택
- 목표 도장 수 선택 (10개 / 20개)
- 한 번 클릭으로 도장 +1
- 진행률(%) 표시
- 목표 달성 시 보상 메시지 표시
- 최근 기록(날짜 + 메모) 확인
- 설정 페이지(현재 프로필 초기화/삭제)
- `localStorage` 영구 저장

## 개발 실행
```bash
npm install
npm run dev
```

## 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 배포 (GitHub Pages)
이 저장소에는 `main` 브랜치에 push 시 자동 배포되는 GitHub Actions 워크플로가 포함되어 있습니다.

- 워크플로 파일: `.github/workflows/deploy-pages.yml`
- Vite `base` 경로는 GitHub Actions 환경에서 자동으로 `/<repo-name>/`로 설정됩니다.

### GitHub에서 1회 설정
1. 저장소 `Settings > Pages`로 이동
2. `Build and deployment`의 `Source`를 `GitHub Actions`로 선택
3. `main` 브랜치에 push
4. Actions 완료 후 Pages URL에서 확인

## 기술 스택
- React 18
- Vite 5
- Tailwind CSS 3
