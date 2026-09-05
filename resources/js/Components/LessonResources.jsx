import { useEffect, useMemo, useState } from 'react';
import {
    ArrowDownTrayIcon,
    ChevronDownIcon,
    DocumentIcon,
    LinkIcon,
    PhotoIcon,
    VideoCameraIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const storageUrl = (path) => `/storage/${path}`;

function getEmbed(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
        if (host.endsWith('youtube.com')) {
            const id = parsed.searchParams.get('v') || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
        }
        if (host.endsWith('facebook.com') || host.endsWith('fb.watch')) {
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
        }
    } catch (_) {
        // Invalid URLs are handled by server validation.
    }
    return null;
}

function isGeneratedFileName(name = '') {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\.[a-z0-9]+)?$/i.test(name);
}

function displayName(resource, fallback, index) {
    return resource.name && !isGeneratedFileName(resource.name) ? resource.name : `${fallback} ${index + 1}`;
}

function isOfficeDocument(resource) {
    const name = resource.name || resource.path || '';
    return /\.(doc|docx|ppt|pptx)$/i.test(name)
        || /(msword|wordprocessingml|ms-powerpoint|presentationml)/i.test(resource.mime || '');
}

function officeApplication(resource) {
    return /\.(ppt|pptx)$/i.test(resource.name || resource.path || '')
        || /(powerpoint|presentationml)/i.test(resource.mime || '')
        ? 'PowerPoint'
        : 'Word';
}

function ResourceSection({ title, icon: Icon, resources, isOpen, onToggle, children }) {
    return (
        <section className="lesson-resource-section overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/70 dark:hover:bg-slate-800 sm:px-5"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 font-bold text-slate-800 dark:text-slate-100">{title}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-slate-800 dark:text-blue-300">{resources.length}</span>
                </span>
                <ChevronDownIcon className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="border-t border-slate-200 p-3 dark:border-slate-700 sm:p-4">{children}</div>}
        </section>
    );
}

function SelectBox({ resource, selectedIds, onToggle }) {
    return (
        <input
            type="checkbox"
            checked={selectedIds.includes(resource.id)}
            onChange={() => onToggle(resource.id)}
            className="h-5 w-5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select ${resource.name || 'resource'}`}
        />
    );
}

export default function LessonResources({
    resources = [],
    viewUrl,
    downloadUrl,
    onView,
    onDownload,
    selectionMode = false,
    onExitSelection,
}) {
    const sections = useMemo(() => {
        const grouped = { embedded: [], videos: [], links: [], documents: [], images: [] };
        resources.forEach((resource) => {
            const embeddedUrl = resource.type === 'url' ? getEmbed(resource.path) : null;
            if (embeddedUrl) grouped.embedded.push({ ...resource, embeddedUrl });
            else if (resource.type === 'video') grouped.videos.push(resource);
            else if (resource.type === 'url') grouped.links.push(resource);
            else if (resource.type === 'image') grouped.images.push(resource);
            else grouped.documents.push(resource);
        });
        return [
            { key: 'embedded', title: 'Embedded Videos', icon: VideoCameraIcon, resources: grouped.embedded },
            { key: 'videos', title: 'Video Files', icon: VideoCameraIcon, resources: grouped.videos },
            { key: 'links', title: 'Online Links', icon: LinkIcon, resources: grouped.links },
            { key: 'documents', title: 'Documents & Activities', icon: DocumentIcon, resources: grouped.documents },
            { key: 'images', title: 'Images', icon: PhotoIcon, resources: grouped.images },
        ].filter((section) => section.resources.length > 0);
    }, [resources]);

    const downloadableResources = useMemo(() => resources.filter((resource) => resource.type !== 'url'), [resources]);
    const resourceSignature = resources.map((resource) => `${resource.id}-${resource.type}-${resource.path}`).join('|');
    const [openSection, setOpenSection] = useState(() => sections[0]?.key ?? null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        setOpenSection(sections[0]?.key ?? null);
        setSelectedIds([]);
    }, [resourceSignature]);

    useEffect(() => {
        if (!selectionMode) setSelectedIds([]);
    }, [selectionMode]);

    if (!resources.length) return null;

    const toggleResource = (id) => setSelectedIds((current) => current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id]);
    const allSelected = downloadableResources.length > 0 && selectedIds.length === downloadableResources.length;
    const toggleAll = () => setSelectedIds(allSelected ? [] : downloadableResources.map((resource) => resource.id));
    const exitSelection = () => {
        setSelectedIds([]);
        onExitSelection?.();
    };
    const handleResourceLinkClick = (event) => {
        const link = event.target.closest('a[target="_blank"]');
        if (!link) return;
        const callback = link.href.includes('/download-resource/') ? onDownload : link.href.includes('/view-resource/') ? onView : null;
        if (!callback) return;
        event.preventDefault();
        callback(link.href);
    };
    const downloadSelected = () => {
        selectedIds.forEach((id, index) => {
            window.setTimeout(() => {
                const link = document.createElement('a');
                link.href = downloadUrl(id);
                link.download = '';
                document.body.appendChild(link);
                link.click();
                link.remove();
            }, index * 400);
        });
    };

    return (
        <div className={`lesson-resources space-y-3 ${selectionMode ? 'pb-24' : ''}`} onClickCapture={handleResourceLinkClick}>
            <style>{`
                .lesson-resource-card { transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
                .lesson-resource-card:hover { transform: translateY(-2px); border-color: rgb(147 197 253); box-shadow: 0 8px 20px rgb(15 23 42 / 0.08); }
                @media (hover: none), (prefers-reduced-motion: reduce) {
                    .lesson-resource-card:hover { transform: none; }
                    .lesson-resource-card, .lesson-resources * { transition-duration: 0.01ms !important; }
                }
            `}</style>

            {selectionMode && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        Select all files
                    </label>
                </div>
            )}

            {sections.map((section) => (
                <ResourceSection key={section.key} {...section} isOpen={openSection === section.key} onToggle={() => setOpenSection((current) => current === section.key ? null : section.key)}>
                    {section.key === 'embedded' && <div className="space-y-4">{section.resources.map((resource, index) => (
                        <div key={resource.id} className="lesson-resource-card overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                            <div className="aspect-video w-full bg-slate-950"><iframe className="h-full w-full" src={resource.embeddedUrl} title={displayName(resource, 'Embedded video', index)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
                            <div className="flex flex-col gap-2 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4"><span className="min-w-0 break-words font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Embedded video', index)}</span><a href={resource.path} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300">Open source</a></div>
                        </div>
                    ))}</div>}

                    {section.key === 'videos' && <div className="space-y-4">{section.resources.map((resource, index) => (
                        <div key={resource.id} className="lesson-resource-card overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
                            <video controls preload="metadata" className="aspect-video w-full" src={storageUrl(resource.path)}>Your browser does not support video playback.</video>
                            <div className="flex flex-col gap-3 bg-white px-3 py-3 text-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                                <label className={`flex min-w-0 items-center gap-3 ${selectionMode ? 'cursor-pointer' : ''}`}>{selectionMode && <SelectBox resource={resource} selectedIds={selectedIds} onToggle={toggleResource} />}<span className="break-words font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Video file', index)}</span></label>
                                {!selectionMode && <a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 sm:w-auto"><ArrowDownTrayIcon className="h-4 w-4" />Download</a>}
                            </div>
                        </div>
                    ))}</div>}

                    {section.key === 'links' && <div className="space-y-2">{section.resources.map((resource, index) => (
                        <div key={resource.id} className="lesson-resource-card flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0"><div className="break-words font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Online resource', index)}</div><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{resource.path}</p></div>
                            <a href={resource.path} target="_blank" rel="noopener noreferrer" className="inline-flex w-full shrink-0 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 sm:w-auto">Open link</a>
                        </div>
                    ))}</div>}

                    {section.key === 'documents' && <div className="space-y-2">{section.resources.map((resource, index) => (
                        <div key={resource.id} className="lesson-resource-card flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                            <label className={`flex min-w-0 items-start gap-3 ${selectionMode ? 'cursor-pointer' : ''}`}>
                                {selectionMode && <SelectBox resource={resource} selectedIds={selectedIds} onToggle={toggleResource} />}
                                <DocumentIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <span className="min-w-0"><span className="block break-words font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Document', index)}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{isOfficeDocument(resource) ? `Download to open in Microsoft ${officeApplication(resource)}.` : 'PDF or attached document'}</span></span>
                            </label>
                            {!selectionMode && <div className="flex w-full items-center gap-2 sm:w-auto">
                                {!isOfficeDocument(resource) && <a href={viewUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 sm:flex-none">View</a>}
                                <a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" aria-label={`Download ${displayName(resource, 'Document', index)}`} title="Download" className={`inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-bold ${isOfficeDocument(resource) ? 'flex-1 bg-blue-600 text-white hover:bg-blue-700 sm:flex-none' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'}`}><ArrowDownTrayIcon className="h-5 w-5" />{isOfficeDocument(resource) && <span className="ml-1.5">Download</span>}</a>
                            </div>}
                        </div>
                    ))}</div>}

                    {section.key === 'images' && <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3">{section.resources.map((resource, index) => (
                        <div key={resource.id} className="lesson-resource-card overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                            <a href={viewUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="group block"><img src={storageUrl(resource.path)} alt={displayName(resource, 'Image', index)} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" /></a>
                            <div className="flex items-center gap-2 px-3 py-3">
                                {selectionMode && <SelectBox resource={resource} selectedIds={selectedIds} onToggle={toggleResource} />}
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Image', index)}</span>
                                {!selectionMode && <a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" aria-label={`Download ${displayName(resource, 'Image', index)}`} title="Download" className="rounded-lg p-2 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-slate-700"><ArrowDownTrayIcon className="h-5 w-5" /></a>}
                            </div>
                        </div>
                    ))}</div>}
                </ResourceSection>
            ))}

            {selectionMode && (
                <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[calc(100%_-_2rem)] max-w-3xl -translate-x-1/2 flex-col gap-3 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-slate-600 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between xl:left-[calc(50%_+_8.75rem)]">
                    <span className="text-center text-sm font-bold text-slate-700 dark:text-slate-200">{selectedIds.length} {selectedIds.length === 1 ? 'file' : 'files'} selected</span>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button type="button" onClick={downloadSelected} disabled={!selectedIds.length} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><ArrowDownTrayIcon className="h-4 w-4" />Download</button>
                        <button type="button" onClick={exitSelection} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"><XMarkIcon className="h-4 w-4" />Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
