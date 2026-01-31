import type { Photo } from '../types';

interface PromptNoteProps {
  photo: Photo;
  onNoteChange: (photoId: string, note: string) => void;
}

export default function PromptNote({ photo, onNoteChange }: PromptNoteProps) {
  return (
    <div className="bg-amber-50/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d97706' fill-opacity='0.02'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      <img
        src={photo.preview}
        alt="Preview"
        className="w-full h-48 object-cover rounded-lg mb-4 shadow-md border-2 border-amber-200"
      />
      <p className="text-sm text-amber-800 mb-3 italic font-serif">
        {photo.prompt}
      </p>
      <textarea
        value={photo.note}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 200) {
            onNoteChange(photo.id, value);
          }
        }}
        placeholder="Viết gì đó về khoảnh khắc này..."
        className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none bg-white/90 font-serif text-amber-900 placeholder-amber-400"
        rows={4}
        maxLength={200}
        style={{ fontFamily: 'serif' }}
      />
      <p className="text-xs text-amber-600 mt-2 text-right">
        {photo.note.length}/200
      </p>
    </div>
  );
}
