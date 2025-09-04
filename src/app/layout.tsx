import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// 폰트 파일이 없으므로 기본 시스템 폰트 사용
// 추후 Pretendard 폰트 파일을 추가할 예정

export const metadata: Metadata = {
  title: "Design4Public Console",
  description: "공공 조달 가구 납품 사례 콘텐츠 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="font-sans antialiased bg-background text-foreground"
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
