import { useState } from 'react';
import { LinkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

const MAX_LINKS = 10;

export default function ExternalLinksInput({ value = [], onChange, errors = {} }) {
    const links = value.length ? value : [];
    const [linkToRemove, setLinkToRemove] = useState(null);

    const updateLink = (index, url) => {
        const next = [...links];
        next[index] = url;
        onChange(next);
    };

    const removeLink = () => {
        if (linkToRemove === null) return;
        onChange(links.filter((_, index) => index !== linkToRemove));
        setLinkToRemove(null);
        toast.success('External link removed. Save changes to apply it.');
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <InputLabel value="External resource links" />
                    <p className="mt-1 text-xs text-slate-500">YouTube, Facebook, Google Drive, DepEd, or any secure web link.</p>
                </div>
                <button type="button" onClick={() => onChange([...links, ''])} disabled={links.length >= MAX_LINKS} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <PlusIcon className="h-4 w-4" /> Add link
                </button>
            </div>

            {links.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">No external links added yet.</div>
            ) : (
                <div className="space-y-2">
                    {links.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
                            <LinkIcon className="ml-1 h-5 w-5 shrink-0 text-blue-600" />
                            <TextInput id={`resource_url_${index}`} type="url" value={url} onChange={(event) => updateLink(index, event.target.value)} className="min-w-0 flex-1 border-0 py-2 shadow-none focus:ring-0" placeholder="https://example.com/resource" />
                            <button type="button" onClick={() => setLinkToRemove(index)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50" aria-label={`Remove link ${index + 1}`}>
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs font-medium text-slate-500">{links.length} of {MAX_LINKS} links added</p>
            <InputError message={errors.resource_urls || errors['resource_urls.0']} />
            <ConfirmModal
                show={linkToRemove !== null}
                onClose={() => setLinkToRemove(null)}
                onConfirm={removeLink}
                title="Remove external link?"
                message="This link will be removed when you save the form."
                confirmText="Remove link"
                cancelText="Cancel"
                danger
            />
        </div>
    );
}
