import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Newspaper, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';

const sectionStyle = {
  width: 'min(1180px, calc(100% - 2rem))',
  margin: '0 auto'
};

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(Number(value || 0)).replace('BDT', 'BDT ');

export default function PublicWebsite() {
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [courseRes, blogRes] = await Promise.all([
          api.get('/public/courses'),
          api.get('/public/blog')
        ]);
        if (cancelled) return;
        setCourses(courseRes.data || []);
        setBlogs(blogRes.data || []);
      } catch (_) {
        if (!cancelled) {
          setCourses([]);
          setBlogs([]);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses]);
  const latestBlogs = useMemo(() => blogs.slice(0, 3), [blogs]);

  const submitContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      const res = await api.post('/public/contact', contact);
      setFeedback(res.data?.message || 'Enquiry submitted successfully.');
      setContact({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not submit your enquiry right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7f0df 0%, #fffaf1 40%, #f3efe6 100%)', color: '#1f2937' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at top left, rgba(180,83,9,0.18), transparent 35%), radial-gradient(circle at top right, rgba(22,101,52,0.12), transparent 30%), #111827' }}>
        <div style={{ ...sectionStyle, padding: '1rem 0 5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', color: '#f8fafc', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 700 }}>Language Academy</div>
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>Public website at root, admin under `/admin`</div>
            </div>
            <a href="/admin" style={{ textDecoration: 'none', background: '#f59e0b', color: '#111827', padding: '0.85rem 1.15rem', borderRadius: '999px', fontWeight: 700 }}>Admin Login</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center', paddingTop: '3rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.16)', color: '#fde68a', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                <Sparkles size={16} /> Learn English. Build confidence. Advance faster.
              </div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.6rem)', lineHeight: 1.02, margin: '0 0 1rem 0', color: '#f8fafc', fontWeight: 800 }}>One academy, one system, one clear learning path.</h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#cbd5e1', maxWidth: '58ch', margin: 0 }}>The website is the main entry point for students and guardians. Operations, accounting, CRM, HR, teachers, and website management all sit under the same secured `/admin` system through role-based access.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
                <a href="#courses" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#111827', padding: '0.95rem 1.2rem', borderRadius: '999px', fontWeight: 700 }}>Explore Courses <ArrowRight size={16} /></a>
                <a href="#contact" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.16)', color: '#f8fafc', padding: '0.95rem 1.2rem', borderRadius: '999px', fontWeight: 700 }}>Book Consultation</a>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '1.4rem', color: '#f8fafc', boxShadow: '0 30px 80px rgba(0,0,0,0.28)' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { label: 'Published Courses', value: courses.length, icon: BookOpen },
                  { label: 'Latest Articles', value: blogs.length, icon: Newspaper },
                  { label: 'Unified Admin', value: 'RBAC', icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', borderRadius: '20px', background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{item.label}</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.2rem' }}>{item.value}</div>
                      </div>
                      <div style={{ width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(245,158,11,0.14)', color: '#fbbf24' }}><Icon size={22} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ ...sectionStyle, padding: '4rem 0 1rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Student-first Website', text: 'The public website is now the main system entry for discovery, enquiries, and enrolment.', icon: GraduationCap },
            { title: 'Single Admin Workspace', text: 'Admin, accounting, CRM, teachers, HR, and website management stay inside one secured /admin area.', icon: ShieldCheck },
            { title: 'Role-Based Access', text: 'Each staff member sees only the modules allowed by their assigned role.', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} style={{ background: '#fff', borderRadius: '24px', padding: '1.3rem', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 12px 32px rgba(15,23,42,0.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: '#fef3c7', color: '#92400e', marginBottom: '0.9rem' }}><Icon size={20} /></div>
                <h3 style={{ margin: '0 0 0.45rem 0', fontSize: '1.05rem', color: '#111827' }}>{item.title}</h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7 }}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="courses" style={{ ...sectionStyle, padding: '3rem 0 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'end', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Featured Courses</div>
            <h2 style={{ margin: '0.35rem 0 0 0', fontSize: '2rem', color: '#111827' }}>Published programs from the academy</h2>
          </div>
          <a href="/admin/website-management" style={{ textDecoration: 'none', color: '#92400e', fontWeight: 700 }}>Manage website content</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {featuredCourses.length ? featuredCourses.map((course) => (
            <article key={course.id} style={{ background: '#fff', borderRadius: '26px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 14px 40px rgba(15,23,42,0.07)' }}>
              <div style={{ height: 180, background: course.image_url ? `linear-gradient(rgba(17,24,39,0.18), rgba(17,24,39,0.45)), url(${course.image_url}) center/cover` : 'linear-gradient(135deg, #1f2937, #92400e)' }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.12em' }}>{course.category || 'Course'}</div>
                <h3 style={{ margin: '0.45rem 0', fontSize: '1.15rem', color: '#111827' }}>{course.title}</h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7, minHeight: 72 }}>{course.short_description || 'Structured coaching with practical learning support and clear academic milestones.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <strong style={{ color: '#111827' }}>{money(course.base_fee)}</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{course.level || 'All Levels'}</span>
                </div>
              </div>
            </article>
          )) : <div style={{ color: '#6b7280' }}>No published courses available yet.</div>}
        </div>
      </section>

      <section style={{ ...sectionStyle, padding: '3rem 0 1rem 0' }}>
        <div style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>News & Insights</div>
        <h2 style={{ margin: '0.35rem 0 1.2rem 0', fontSize: '2rem', color: '#111827' }}>Latest stories from Language Academy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {latestBlogs.length ? latestBlogs.map((blog) => (
            <article key={blog.id} style={{ background: '#fff', borderRadius: '24px', padding: '1.25rem', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Draft'}</div>
              <h3 style={{ margin: '0.55rem 0', color: '#111827' }}>{blog.title}</h3>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7 }}>{blog.excerpt || 'Fresh updates from our academic, admissions, and learning support teams.'}</p>
            </article>
          )) : <div style={{ color: '#6b7280' }}>No published blog posts available yet.</div>}
        </div>
      </section>

      <section id="contact" style={{ ...sectionStyle, padding: '3rem 0 5rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#111827', color: '#f8fafc', borderRadius: '28px', padding: '1.6rem' }}>
            <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Contact</div>
            <h2 style={{ margin: '0.5rem 0 0.8rem 0', fontSize: '2rem' }}>Talk to the admissions team</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8 }}>Send an enquiry from the main website. The lead enters CRM automatically, while staff handle everything else inside the RBAC-protected admin system.</p>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.3rem', color: '#e5e7eb' }}>
              <div>Phone: +880 1700-000000</div>
              <div>Email: hello@languageacademy.com</div>
              <div>Admin workspace: /admin</div>
            </div>
          </div>

          <form onSubmit={submitContact} style={{ background: '#fff', borderRadius: '28px', padding: '1.6rem', border: '1px solid rgba(15,23,42,0.08)', display: 'grid', gap: '0.85rem' }}>
            {['name', 'email', 'phone', 'subject'].map((field) => (
              <input
                key={field}
                value={contact[field]}
                onChange={(e) => setContact((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                style={{ padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
              />
            ))}
            <textarea
              value={contact.message}
              onChange={(e) => setContact((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us what you want to learn"
              rows={5}
              style={{ padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid #d1d5db', fontSize: '0.95rem', resize: 'vertical' }}
            />
            {feedback && <div style={{ fontSize: '0.85rem', color: feedback.toLowerCase().includes('success') ? '#166534' : '#b91c1c' }}>{feedback}</div>}
            <button type="submit" disabled={submitting} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.95rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Send Enquiry'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
