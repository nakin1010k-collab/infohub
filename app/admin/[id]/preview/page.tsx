import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/" + id + "/preview");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content, status, reading_minutes, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!article) notFound();

  return (
    <main className="auth-page">
      <div className="auth-shell admin-shell">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card admin-card" aria-labelledby="preview-title">
          <div className="admin-heading-row">
            <div>
              <p className="eyebrow">EDITORIAL PREVIEW</p>
              <h1 id="preview-title">{article.title}</h1>
              <p className="field-hint">Preview ภายใน · สถานะ {article.status} · อ่านประมาณ {article.reading_minutes ?? 1} นาที</p>
            </div>
            <div className="admin-heading-actions">
              <Link className="state-action" href={"/admin/" + id}>แก้ไข</Link>
              <Link className="primary-button" href="/admin/queue">คิวตรวจ</Link>
            </div>
          </div>
          {article.excerpt ? <p className="preview-excerpt">{article.excerpt}</p> : null}
          <article className="preview-article">
            {article.content.split(/\n{2,}/).map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
          <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href={"/news/" + article.slug}>ลิงก์ public (ใช้ได้เมื่อเผยแพร่)</Link></p>
        </section>
      </div>
    </main>
  );
}
