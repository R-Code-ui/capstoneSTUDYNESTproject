import { useEffect, useMemo, useState } from 'react';
import { ArrowDownTrayIcon, ChevronDownIcon, DocumentIcon, LinkIcon, PhotoIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    } catch (_) { /* Validation on the server handles invalid URLs. */ }
    return null;
}

function isGeneratedFileName(name = '') {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\.[a-z0-9]+)?$/i.test(name);
}

function displayName(resource, fallback, index) {
    return resource.name && !isGeneratedFileName(resource.name) ? resource.name : `${fallback} ${index + 1}`;
}

function ResourceSection({ title, icon: Icon, resources, isOpen, onToggle, children }) {
    return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button type="button" onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 sm:px-5">
            <span className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Icon className="h-5 w-5" /></span><span className="min-w-0 font-semibold text-slate-800 dark:text-slate-100">{title}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{resources.length}</span></span>
            <ChevronDownIcon className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="border-t border-slate-200 p-3 dark:border-slate-700 sm:p-4">{children}</div>}
    </section>;
}

export default function StudentResources({ resources = [], viewUrl, downloadUrl }) {
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

    if (!resources.length) return null;

    const toggleSection = (key) => setOpenSection((current) => current === key ? null : key);
    const toggleResource = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
    const toggleSectionResources = (sectionResources) => {
        const sectionIds = sectionResources.map((resource) => resource.id);
        const sectionIsSelected = sectionIds.every((id) => selectedIds.includes(id));
        setSelectedIds((current) => sectionIsSelected
            ? current.filter((id) => !sectionIds.includes(id))
            : [...new Set([...current, ...sectionIds])]);
    };
    const allSelected = downloadableResources.length > 0 && selectedIds.length === downloadableResources.length;
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

    return <div className="space-y-3">
        {downloadableResources.length > 0 && <div className="sticky top-3 z-10 rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm dark:border-blue-900 dark:bg-slate-800 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelectedIds([]) : setSelectedIds(downloadableResources.map((resource) => resource.id))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Select all files</label>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0"><span className="mr-1 text-sm font-medium text-slate-600 dark:text-slate-300">{selectedIds.length} selected</span>{selectedIds.length > 0 && <><button type="button" onClick={downloadSelected} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"><ArrowDownTrayIcon className="h-4 w-4" />Download selected files</button><button type="button" onClick={() => setSelectedIds([])} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-slate-600 hover:bg-blue-100 dark:text-slate-300 dark:hover:bg-slate-700"><XMarkIcon className="h-4 w-4" />Clear</button></>}</div>
        </div>}
        {sections.map((section) => <ResourceSection key={section.key} {...section} isOpen={openSection === section.key} onToggle={() => toggleSection(section.key)}>
            {section.key === 'embedded' && <div className="space-y-4">{section.resources.map((resource, index) => <div key={resource.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"><div className="aspect-video w-full bg-slate-950"><iframe className="h-full w-full" src={resource.embeddedUrl} title={displayName(resource, 'Embedded video', index)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="flex items-center justify-between gap-3 px-3 py-3 text-sm sm:px-4"><span className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Embedded video', index)}</span><a href={resource.path} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300">Open source</a></div></div>)}</div>}
            {section.key === 'videos' && <div className="space-y-4"><label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={section.resources.every((resource) => selectedIds.includes(resource.id))} onChange={() => toggleSectionResources(section.resources)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Select all videos</label>{section.resources.map((resource, index) => <div key={resource.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950"><video controls preload="metadata" className="aspect-video w-full" src={storageUrl(resource.path)}>Your browser does not support video playback.</video><div className="flex flex-wrap items-center justify-between gap-3 bg-white px-3 py-3 text-sm dark:bg-slate-900 sm:px-4"><span className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Video file', index)}</span><div className="flex items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={selectedIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Select</label><a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300"><ArrowDownTrayIcon className="mr-1 inline h-4 w-4" />Download</a></div></div></div>)}</div>}
            {section.key === 'links' && <div className="space-y-2">{section.resources.map((resource, index) => <div key={resource.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60"><div className="min-w-0"><div className="truncate font-semibold text-slate-800 dark:text-slate-100">{displayName(resource, 'Online resource', index)}</div><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{resource.path}</p></div><a href={resource.path} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Open link</a></div>)}</div>}
            {section.key === 'documents' && <div className="space-y-2"><label className="inline-flex cursor-pointer items-center gap-2 pb-2 text-sm font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={section.resources.every((resource) => selectedIds.includes(resource.id))} onChange={() => toggleSectionResources(section.resources)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Select all documents</label>{section.resources.map((resource, index) => <div key={resource.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60"><div className="min-w-0"><div className="truncate font-semibold text-slate-800 dark:text-slate-100"><DocumentIcon className="mr-2 inline h-5 w-5 text-amber-600" />{displayName(resource, 'Document', index)}</div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Attached file</p></div><div className="flex flex-wrap items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={selectedIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Select</label><a href={viewUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">View</a><a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">Download</a></div></div>)}</div>}
            {section.key === 'images' && <div className="space-y-3"><label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={section.resources.every((resource) => selectedIds.includes(resource.id))} onChange={() => toggleSectionResources(section.resources)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Select all images</label><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{section.resources.map((resource, index) => <div key={resource.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"><a href={viewUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="group block"><img src={storageUrl(resource.path)} alt={displayName(resource, 'Image', index)} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105" /><span className="block truncate px-3 pt-2 text-sm font-medium text-slate-800 dark:text-slate-100">{displayName(resource, 'Image', index)}</span></a><div className="flex flex-wrap items-center gap-2 px-3 py-3"><label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={selectedIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Select</label><a href={downloadUrl(resource.id)} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300"><ArrowDownTrayIcon className="mr-1 inline h-4 w-4" />Download</a></div></div>)}</div></div>}
        </ResourceSection>)}
    </div>;
}
