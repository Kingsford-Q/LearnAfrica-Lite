import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Share2, Download, ArrowLeft, Linkedin, Twitter, Facebook, AlertCircle, Loader2, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { api } from '@/lib/apiClient';

const GOLD = '#c9a44c';
const GOLD_DARK = '#8a6a24';
const NAVY = '#16223d';
const INK = '#5c5344';

function LaurelWreath({ className, style }) {
  const leaves = Array.from({ length: 6 });
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none">
      <circle cx="50" cy="83" r="2.4" fill="currentColor" />
      {[1, -1].map((dir) => (
        <g key={dir} transform={dir === -1 ? 'translate(100,0) scale(-1,1)' : undefined}>
          <path d="M48 82 C 26 80, 12 60, 17 34" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {leaves.map((_, i) => {
            const t = i / (leaves.length - 1);
            const x = 48 - t * 30 + Math.sin(t * 3) * 1.5;
            const y = 80 - t * 46;
            const angle = -30 - t * 60;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="7.5"
                ry="3.1"
                fill="currentColor"
                transform={`rotate(${angle} ${x} ${y})`}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function CornerOrnament({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <path d="M2 22 L2 6 Q2 2 6 2 L22 2" stroke={GOLD} strokeWidth="1.4" />
      <path d="M2 30 L2 26" stroke={GOLD} strokeWidth="1.4" />
      <path d="M26 2 L30 2" stroke={GOLD} strokeWidth="1.4" />
      <rect x="14.5" y="14.5" width="9" height="9" transform="rotate(45 19 19)" fill="none" stroke={GOLD} strokeWidth="1.3" />
      <circle cx="19" cy="19" r="1.6" fill={GOLD} />
    </svg>
  );
}

function RibbonSeal({ className }) {
  return (
    <svg viewBox="0 0 100 132" className={className}>
      <polygon points="33,68 67,68 76,124 50,107 24,124" fill={GOLD} />
      <polygon points="33,68 67,68 60,116 50,107 40,116" fill={GOLD_DARK} />
      <circle cx="50" cy="42" r="39" fill={NAVY} stroke={GOLD} strokeWidth="3" />
      <circle cx="50" cy="42" r="31" fill="none" stroke={GOLD} strokeWidth="1" strokeDasharray="2.5 3.5" />
      <text x="50" y="39" textAnchor="middle" fontSize="12" fill={GOLD} fontFamily="'Playfair Display', serif" fontWeight="700">
        LAF
      </text>
      <text x="50" y="52" textAnchor="middle" fontSize="5.5" fill="#e8d9b5" letterSpacing="1.5" fontFamily="Inter, sans-serif">
        CERTIFIED
      </text>
    </svg>
  );
}

function Guilloche({ className, style }) {
  const rings = Array.from({ length: 7 });
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none">
      {rings.map((_, i) => (
        <circle key={i} cx="100" cy="100" r={16 + i * 13} stroke="currentColor" strokeWidth="0.6" />
      ))}
    </svg>
  );
}

function SignatureBlock({ name, title }) {
  return (
    <div className="text-center min-w-0 max-w-[92px] xs:max-w-[130px] sm:max-w-[160px]">
      <div
        className="text-sm xs:text-base sm:text-lg mb-1 truncate"
        style={{ fontFamily: "'Great Vibes', cursive", color: NAVY }}
      >
        {name}
      </div>
      <div className="h-px w-full" style={{ backgroundColor: `${NAVY}4d` }} />
      <p className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider mt-1" style={{ color: GOLD_DARK }}>
        {title}
      </p>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div
      className="px-1.5 py-1.5 xs:px-3 xs:py-2 min-w-0"
      style={{ border: `1px solid ${GOLD}4d`, backgroundColor: `${GOLD}0d` }}
    >
      <p className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider truncate" style={{ color: `${GOLD_DARK}b3` }}>
        {label}
      </p>
      <p
        className="text-[10px] xs:text-xs sm:text-sm font-bold mt-0.5 truncate"
        style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Single certificate design, used for both the on-screen preview and the
 * downloaded file. The download is a real generated PDF (html2canvas + jsPDF,
 * lazy-loaded only when the button is clicked) rather than window.print() --
 * print-to-PDF support is inconsistent across mobile browsers and often
 * unavailable at all inside in-app webviews, whereas a generated file download
 * works the same way everywhere a real browser tab is open.
 */
export default function CertificatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [courseDuration, setCourseDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    Promise.all([
      api.get(`/api/certificates/course/${courseId}`),
      api.get(`/api/courses/${courseId}`).catch(() => null),
    ])
      .then(([cert, course]) => {
        if (cancelled) return;
        setCertificate(cert);
        setCourseDuration(course?.duration || null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const formattedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const verifyUrl = certificate
    ? `${window.location.origin}/verify/${certificate.verificationCode}`
    : '';

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError('');
    try {
      const node = document.getElementById('certificate-content');
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(node, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fffdf7',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Certificate captured at zero size');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`LearnAfrica-Certificate-${certificate.verificationCode}.pdf`);
    } catch (err) {
      console.error('Certificate PDF generation failed, falling back to print:', err);
      setDownloadError("Couldn't generate a PDF directly -- opening print instead, choose \"Save as PDF\" there.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `My ${certificate?.courseTitle} Certificate`,
      text: `I just completed ${certificate?.courseTitle} on LearnAfrica!`,
      url: verifyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled native share sheet
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const openShareWindow = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleShareLinkedIn = () => openShareWindow(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`
  );

  const handleShareTwitter = () => openShareWindow(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `I just completed ${certificate?.courseTitle} on LearnAfrica Lite!`
    )}&url=${encodeURIComponent(verifyUrl)}`
  );

  const handleShareFacebook = () => openShareWindow(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">
            Preparing your certificate...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !certificate) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-5">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We couldn't verify a valid course completion record for this certificate credential.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="py-4 px-3 sm:py-8 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 print:hidden">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center hover:bg-transparent gap-1.5 text-muted-foreground hover:text-muted-foreground border-none bg-transparent transition-colors text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:block">Back to Results Page</span>
              <span className="md:hidden block">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-lg text-xs h-8 px-2.5 sm:px-3"
              >
                <Share2 className="w-3.5 h-3.5 md:mr-1" />
                <span className="hidden md:block">Share</span>
              </Button>

              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="rounded-lg shadow-sm text-xs h-8 px-2.5 sm:px-3"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 md:mr-1 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 md:mr-1" />
                )}
                <span className="hidden md:block">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
              </Button>
            </div>
          </div>

          {downloadError && (
            <p className="text-xs text-amber-600 dark:text-amber-500 text-center mb-4 px-2 print:hidden">{downloadError}</p>
          )}

          {/* Certificate -- height is intentionally content-driven (no aspect-ratio
              lock). html2canvas and browser print engines don't reliably honor
              CSS aspect-ratio, which used to collapse this box's height on
              mobile/print and make every line of text overlap. Letting it size
              naturally guarantees the on-screen view, the downloaded PDF and a
              native print all render identically, on every viewport. */}
          <div
            id="certificate-content"
            className="relative mx-auto shadow-2xl print:shadow-none"
            style={{
              background: 'linear-gradient(135deg, #fffdf7 0%, #fffdf7 55%, #faf3e2 100%)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Outer gold border + inner navy hairline */}
            <div className="absolute inset-[8px] xs:inset-3 sm:inset-4 pointer-events-none" style={{ border: `3px solid ${GOLD}` }} />
            <div className="absolute inset-[15px] xs:inset-5 sm:inset-7 pointer-events-none" style={{ border: `1px solid ${NAVY}33` }} />

            {/* Corner ornaments */}
            <CornerOrnament className="absolute top-1.5 left-1.5 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12" />
            <CornerOrnament className="absolute top-1.5 right-1.5 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 -scale-x-100" />
            <CornerOrnament className="absolute bottom-1.5 left-1.5 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 -scale-y-100" />
            <CornerOrnament className="absolute bottom-1.5 right-1.5 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 -scale-x-100 -scale-y-100" />

            {/* Watermark */}
            <Guilloche className="absolute inset-0 m-auto w-[60%] h-[60%] opacity-[0.05] pointer-events-none" style={{ color: NAVY }} />

            <div className="relative flex flex-col items-center text-center px-5 py-7 xs:px-10 xs:py-8 sm:px-16 sm:py-10">
              {/* Header / Crest */}
              <div className="w-full flex flex-col items-center">
                <div className="relative w-12 h-12 xs:w-16 xs:h-16 sm:w-[4.75rem] sm:h-[4.75rem] mb-1.5 xs:mb-2">
                  <LaurelWreath className="absolute inset-0 w-full h-full" style={{ color: GOLD }} />
                  <div
                    className="absolute inset-[24%] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: NAVY, border: `2px solid ${GOLD}` }}
                  >
                    <Award className="w-[48%] h-[48%]" style={{ color: GOLD }} strokeWidth={1.5} />
                  </div>
                </div>

                <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD_DARK }}>
                  LearnAfrica Lite
                </p>

                <h1
                  className="mt-1 text-xl xs:text-3xl sm:text-4xl md:text-[2.75rem] uppercase tracking-[0.1em]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: NAVY }}
                >
                  Certificate
                </h1>
                <p className="text-[9px] xs:text-xs sm:text-sm tracking-[0.4em] uppercase -mt-0.5" style={{ color: GOLD_DARK }}>
                  of Completion
                </p>

                <div className="flex items-center gap-2 xs:gap-3 justify-center mt-2 xs:mt-2.5">
                  <div className="h-px w-10 xs:w-14 sm:w-20" style={{ backgroundColor: GOLD }} />
                  <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
                  <div className="h-px w-10 xs:w-14 sm:w-20" style={{ backgroundColor: GOLD }} />
                </div>
              </div>

              {/* Recipient */}
              <div className="w-full flex flex-col items-center py-4 xs:py-5 sm:py-6">
                <p className="text-[11px] xs:text-xs sm:text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: INK }}>
                  This certifies that
                </p>

                <h2
                  className="mt-2 xs:mt-2.5 mb-1.5 xs:mb-2 px-2 max-w-full break-words text-3xl xs:text-5xl sm:text-6xl md:text-[4.25rem] leading-[1.15]"
                  style={{ fontFamily: "'Great Vibes', cursive", color: NAVY }}
                >
                  {certificate.userName}
                </h2>
                <div className="h-px w-40 xs:w-56 sm:w-72" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />

                <p className="mt-3 xs:mt-3 text-[11px] xs:text-xs sm:text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: INK }}>
                  has successfully completed the course
                </p>
                <h3
                  className="mt-1.5 text-base xs:text-base sm:text-lg md:text-xl px-2 max-w-full break-words font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
                >
                  {certificate.courseTitle}
                </h3>

                <div className={`grid ${courseDuration ? 'grid-cols-3' : 'grid-cols-2'} gap-2 xs:gap-3 max-w-xs xs:max-w-sm sm:max-w-md mx-auto mt-4 xs:mt-5 w-full`}>
                  <StatPill label="Grade" value={certificate.grade} />
                  {courseDuration && <StatPill label="Duration" value={courseDuration} />}
                  <StatPill label="Completed" value={formattedDate} />
                </div>
              </div>

              {/* Signatures + Seal */}
              <div className="w-full">
                <div className="flex flex-row items-end justify-center gap-5 xs:gap-10 sm:gap-16 pt-1">
                  <SignatureBlock name={certificate.instructorName} title="Instructor" />
                  <RibbonSeal className="w-11 h-14 xs:w-12 xs:h-[4.1rem] sm:w-14 sm:h-[4.6rem] shrink-0" />
                  <SignatureBlock name="LearnAfrica Team" title="Director" />
                </div>

                <div className="mt-3 xs:mt-4 pt-2.5 xs:pt-3 text-center" style={{ borderTop: `1px solid ${NAVY}26` }}>
                  <p className="text-[8px] xs:text-[9px] sm:text-[10px] truncate" style={{ color: `${INK}cc` }}>
                    Certificate ID: <span className="font-mono font-semibold" style={{ color: NAVY }}>{certificate.verificationCode}</span>
                  </p>
                  <p className="text-[7px] xs:text-[8px] sm:text-[9px] mt-0.5 truncate" style={{ color: `${INK}99` }}>
                    Verify authenticity at {window.location.host}/verify/{certificate.verificationCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Share Group */}
          <div className="mt-5 sm:mt-6 text-center print:hidden">
            <p className="text-muted-foreground mb-2 sm:mb-3 text-xs">
              Share your achievement
            </p>

            <div className="flex justify-center gap-2.5">
              <button
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Linkedin className="w-4 h-4 group-hover:text-[#0A66C2]" />
              </button>
              <button
                onClick={handleShareTwitter}
                aria-label="Share on X"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Twitter className="w-4 h-4 group-hover:text-[#1DA1F2]" />
              </button>
              <button
                onClick={handleShareFacebook}
                aria-label="Share on Facebook"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Facebook className="w-4 h-4 group-hover:text-[#1877F2]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
