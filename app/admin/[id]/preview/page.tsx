import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getArticleRelations, getCurrentEditor } from "@/lib/appwrite/admin";

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getCurrentEditor();
  if (!auth.ok) redirect(auth.reason === "unauthorized" ? "/login?next=/admin/" + id + "/preview" : "/dashboard");
  const { article } = await getArticleRelations(id);
  if (!article) notFound();

  return (
    <main className="auth-page">
      <div className="auth-shell admin-shell">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card admin-card" aria-labelledby="preview-title">
          <div className="admin-heading-row">
            <div>
              <p className="eyebrow">EDITORIAL PREVIEW</p>
              <h1 id="preview-title">{String(article.title ?? "")}</h1>
              <p className="field-hint">Preview ภายใน · สถานะ {String(article.status ?? "draft")} · อ่านประมาณ {Number(article.reading_minutes ?? 1)} นาที</p>
            </div>
            <div className="admin-heading-actions">
              <Link className="state-action" href={"/admin/" + id}>แก้ไข</Link>
              <Link className="primary-button" href="/admin/queue">คิวตรวจ</Link>
            </div>
          </div>
          {article.excerpt ? <p className="preview-excerpt">{String(article.excerpt)}</p> : null}
          <article className="preview-article">
            {String(article.content ?? "").split(/\n{2,}/).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
          </article>
          <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href={"/news/" + String(article.slug ?? "")}>ลิงก์ public (ใช้ได้เมื่อเผยแพร่)</Link></p>
        </section>
      </div>
    </main>
  );
}
