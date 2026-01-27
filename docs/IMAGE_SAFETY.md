# 이미지 깨짐 방지 가이드

대회 포스터 등 외부 이미지를 안전하게 처리하는 방법.

---

## 1. 현재 적용된 방안

### ✅ Next.js Image 설정 (`next.config.ts`)
- **remotePatterns**에 Supabase 도메인 추가
- 허용된 호스트만 이미지 로드 가능 (보안)

### ✅ 업로드 시 검증 (`admin/write/page.tsx`)
- **파일 크기**: 5MB 이하만 허용
- **파일 형식**: JPG, PNG, WEBP만 허용
- 검증 실패 시 즉시 alert + 업로드 중단

### ✅ Fallback UI (`TournamentCard.tsx`)
- `onError` 핸들러: 이미지 로드 실패 시 숨김
- 이미지 없으면 Trophy 아이콘 표시

---

## 2. 추가로 고려할 수 있는 방안

### 🔹 이미지 압축/리사이징 (클라이언트)
- **browser-image-compression** 라이브러리 사용
- 업로드 전에 브라우저에서 자동 압축 (용량↓, 속도↑)

```bash
npm install browser-image-compression
```

```tsx
import imageCompression from 'browser-image-compression';

const handleImageChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // 압축 옵션
  const options = {
    maxSizeMB: 1,          // 최대 1MB
    maxWidthOrHeight: 1920 // 최대 가로/세로
  };
  
  const compressed = await imageCompression(file, options);
  setImageFile(compressed);
};
```

### 🔹 CDN 활용
- Supabase Storage는 기본 CDN 제공
- Cloudflare Images, imgix 등으로 변환 시 자동 최적화 가능

### 🔹 Lazy Loading
- TournamentCard에 `loading="lazy"` (Next Image는 기본 적용됨)

### 🔹 Blur Placeholder
- 이미지 로딩 중 흐릿한 배경 표시

```tsx
<Image 
  src={url} 
  fill 
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..." // 작은 base64
/>
```

### 🔹 Error Boundary
- 컴포넌트 레벨에서 에러 잡기 (전체 UI 깨지지 않게)

---

## 3. 권장 순서

**지금 단계 (MVP):**
1. ✅ 파일 크기·형식 검증 (완료)
2. ✅ Fallback UI (완료)
3. ✅ Next.js remotePatterns 설정 (완료)

**다음 단계 (확장):**
1. 클라이언트 압축 (browser-image-compression)
2. Blur placeholder (로딩 UX 개선)

**스케일 업 시:**
1. CDN 전환 (Cloudflare Images)
2. 서버에서 Thumbnail 자동 생성

---

**현재 적용된 코드로도 "이미지 깨짐"은 충분히 방지 가능**하고,  
나중에 트래픽 늘면 압축/CDN 추가하면 됩니다.
