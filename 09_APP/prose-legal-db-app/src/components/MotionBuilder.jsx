import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Sparkles, CheckCircle2, X, Plus, Trash2 } from 'lucide-react';

const MOTION_TEMPLATES = {
  'Motion for Custody': {
    title: 'Motion for Custody',
    sections: [
      { name: 'Introduction', required: true },
      { name: 'Factual Background', required: true },
      { name: 'Legal Argument', required: true },
      { name: 'Requested Relief', required: true },
      { name: 'Conclusion', required: false }
    ]
  },
  'Affidavit': {
    title: 'Affidavit',
    sections: [
      { name: 'Personal Information', required: true },
      { name: 'Statement of Facts', required: true },
      { name: 'Exhibits Referenced', required: false },
      { name: 'Verification', required: true }
    ]
  },
  'Motion to Compel': {
    title: 'Motion to Compel',
    sections: [
      { name: 'Introduction', required: true },
      { name: 'Background', required: true },
      { name: 'Discovery Requests', required: true },
      { name: 'Legal Basis', required: true },
      { name: 'Requested Relief', required: true }
    ]
  },
  'Response to Motion': {
    title: 'Response to Motion',
    sections: [
      { name: 'Introduction', required: true },
      { name: 'Response to Allegations', required: true },
      { name: 'Counter-Arguments', required: false },
      { name: 'Requested Relief', required: true }
    ]
  }
};

const MotionBuilder = ({ events, exhibits }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('Motion for Custody');
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [sections, setSections] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);

  const template = MOTION_TEMPLATES[selectedTemplate];

  // Auto-populate sections from selected events
  const populateFromEvents = () => {
    const selected = Array.from(selectedEvents).map(id => 
      events.find(e => e.event_id === id)
    ).filter(Boolean);

    if (selected.length === 0) return;

    const newSections = { ...sections };
    
    // Factual Background
    if (template.sections.find(s => s.name === 'Factual Background')) {
      const background = selected
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .map(e => {
          const date = e.event_date;
          const desc = e.description_neutral || e.description;
          const exhibit = e.exhibit_code ? ` (See Exhibit ${e.exhibit_code})` : '';
          return `On ${date}, ${desc}${exhibit}.`;
        })
        .join('\n\n');
      newSections['Factual Background'] = background;
    }

    // Statement of Facts (for Affidavit)
    if (template.sections.find(s => s.name === 'Statement of Facts')) {
      const facts = selected
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .map(e => {
          const date = e.event_date;
          const desc = e.description_neutral || e.description;
          return `On ${date}, ${desc}.`;
        })
        .join('\n\n');
      newSections['Statement of Facts'] = facts;
    }

    // Exhibits Referenced
    const exhibitList = selected
      .map(e => e.exhibit_code)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');
    
    if (exhibitList && template.sections.find(s => s.name === 'Exhibits Referenced')) {
      newSections['Exhibits Referenced'] = `The following exhibits are referenced: ${exhibitList}`;
    }

    setSections(newSections);
  };

  // Generate document with AI enhancement
  const generateDocument = async () => {
    setIsGenerating(true);
    
    const selected = Array.from(selectedEvents).map(id => 
      events.find(e => e.event_id === id)
    ).filter(Boolean);

    try {
      // Build document structure
      let doc = `IN THE COURT OF COMMON PLEAS\n`;
      doc += `MONTGOMERY COUNTY, PENNSYLVANIA\n\n`;
      doc += `${selectedTemplate.toUpperCase()}\n\n`;
      doc += `---\n\n`;

      // Generate each section
      for (const section of template.sections) {
        doc += `**${section.name}**\n\n`;
        
        if (sections[section.name]) {
          doc += sections[section.name] + '\n\n';
        } else if (section.required) {
          doc += `[${section.name} content required]\n\n`;
        }
        
        doc += '---\n\n';
      }

      // Add verification for Affidavit
      if (selectedTemplate === 'Affidavit') {
        doc += `VERIFICATION\n\n`;
        doc += `I, [Your Name], hereby verify under penalty of perjury that the foregoing statements are true and correct to the best of my knowledge, information, and belief.\n\n`;
        doc += `Date: ${new Date().toLocaleDateString()}\n\n`;
        doc += `_________________________\n`;
        doc += `[Your Signature]\n`;
      }

      setGeneratedDoc(doc);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDocument = (format) => {
    if (!generatedDoc) return;

    if (format === 'txt') {
      const blob = new Blob([generatedDoc], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
    } else if (format === 'pdf') {
      // For PDF, we'd need a library like jsPDF or html2pdf
      // For now, open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>${selectedTemplate}</title></head>
          <body style="font-family: Times, serif; padding: 2in; line-height: 1.6;">
            <pre style="white-space: pre-wrap;">${generatedDoc.replace(/\n/g, '<br>')}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Motion/Affidavit Builder
            </h2>
            <p className="text-sm text-slate-600 mt-1">Generate court documents from your timeline</p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Document Type
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              setSections({});
              setSelectedEvents(new Set());
            }}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(MOTION_TEMPLATES).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Event Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Timeline Events to Include
          </label>
          <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No events available. Add events to your timeline first.</p>
            ) : (
              <div className="space-y-2">
                {events.map(event => (
                  <label
                    key={event.event_id}
                    className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.event_id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedEvents);
                        if (e.target.checked) {
                          newSet.add(event.event_id);
                        } else {
                          newSet.delete(event.event_id);
                        }
                        setSelectedEvents(newSet);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {event.event_date} - {event.short_title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {event.description_neutral || event.description}
                      </div>
                      {event.exhibit_code && (
                        <div className="text-xs text-blue-600 mt-1">
                          Exhibit: {event.exhibit_code}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedEvents.size > 0 && (
            <button
              onClick={populateFromEvents}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Populate Sections from Selected Events
            </button>
          )}
        </div>

        {/* Section Editors */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Document Sections
          </label>
          <div className="space-y-4">
            {template.sections.map(section => (
              <div key={section.name} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-900">
                    {section.name}
                    {section.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
                <textarea
                  value={sections[section.name] || ''}
                  onChange={(e) => setSections({ ...sections, [section.name]: e.target.value })}
                  placeholder={section.required ? `Required: ${section.name}` : `Optional: ${section.name}`}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={generateDocument}
            disabled={isGenerating || selectedEvents.size === 0}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Document
              </>
            )}
          </button>

          {generatedDoc && (
            <>
              <button
                onClick={() => exportDocument('txt')}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export TXT
              </button>
              <button
                onClick={() => exportDocument('pdf')}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print/PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generated Document Preview */}
      {generatedDoc && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Generated Document Preview</h3>
          <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-900">
              {generatedDoc}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotionBuilder;

