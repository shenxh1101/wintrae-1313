import { useState } from 'react';
import { Download, Copy, Check, FileText, Users } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { exportAsText, exportByPerson, copyToClipboard, downloadAsFile, exportAsJSON } from '@/utils/exportUtils';

const ExportPanel = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!plan) return null;

  const handleCopyAll = async () => {
    const text = exportAsText(plan);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'txt' | 'json') => {
    const content = format === 'json' ? exportAsJSON(plan) : exportAsText(plan);
    const filename = format === 'json' ? `${plan.name}.json` : `${plan.name}-装备清单.txt`;
    const type = format === 'json' ? 'application/json' : 'text/plain';
    downloadAsFile(content, filename, type);
    setShowExportMenu(false);
  };

  const handleDownloadByPerson = (memberId: string) => {
    const member = plan.crew.find(m => m.id === memberId);
    if (!member) return;
    const text = exportByPerson(plan, memberId);
    downloadAsFile(text, `${member.name}-个人装备清单.txt`, 'text/plain');
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-forest-700 rounded-xl font-medium transition-colors"
        >
          {copied ? (
            <><Check className="w-4 h-4" /> 已复制</>
          ) : (
            <><Copy className="w-4 h-4" /> 复制清单</>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-hover border border-cream-200 overflow-hidden z-50 animate-slide-in">
              <div className="p-2">
                <p className="text-xs text-earth-500 px-2 py-1">导出为文件</p>
                <button
                  onClick={() => handleDownload('txt')}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cream-50 rounded-lg text-left text-sm text-forest-800"
                >
                  <FileText className="w-4 h-4 text-earth-500" />
                  文本格式 (.txt)
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cream-50 rounded-lg text-left text-sm text-forest-800"
                >
                  <FileText className="w-4 h-4 text-earth-500" />
                  JSON 格式 (.json)
                </button>
              </div>
              
              <div className="border-t border-cream-100 p-2">
                <p className="text-xs text-earth-500 px-2 py-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  按人导出
                </p>
                {plan.crew.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleDownloadByPerson(member.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cream-50 rounded-lg text-left text-sm text-forest-800"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    {member.name} 的清单
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default ExportPanel;
