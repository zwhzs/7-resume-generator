import { useState, useEffect } from 'react'

window.jspdf = window.jspdf || {};
window.html2canvas = window.html2canvas || {};

const defaultFormData = {
  name: '',
  gender: '',
  age: '',
  phone: '',
  email: '',
  location: '',
  education: [
    {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      GPA: '',
    }
  ],
  experience: [
    {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    }
  ],
  projects: [
    {
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: '',
    }
  ],
  skills: [
    { category: '编程语言', items: '' },
    { category: '框架/库', items: '' },
    { category: '工具', items: '' },
  ],
  certificates: '',
  selfAssessment: '',
}

const templateConfigs = {
  simple: {
    name: '简约模板',
    color: '#374151',
    accentColor: '#6b7280',
    showGPA: false,
    showSelfAssessment: false,
    fontSize: { name: 'text-2xl', section: 'text-sm', body: 'text-xs' }
  },
  tech: {
    name: '技术风模板',
    color: '#0891b2',
    accentColor: '#06b6d4',
    showGPA: true,
    showSelfAssessment: false,
    fontSize: { name: 'text-xl', section: 'text-xs', body: 'text-xs' }
  },
  business: {
    name: '商务模板',
    color: '#1e3a5f',
    accentColor: '#2563eb',
    showGPA: false,
    showSelfAssessment: true,
    fontSize: { name: 'text-2xl', section: 'text-sm', body: 'text-sm' }
  }
}

function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('resumeFormData')
    return saved ? JSON.parse(saved) : defaultFormData
  })
  const [selectedTemplate, setSelectedTemplate] = useState('simple')
  const [exportStatus, setExportStatus] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData))
    if (historyIndex === -1) {
      setHistory([{ data: formData, time: new Date().toLocaleString(), action: '初始化表单' }])
      setHistoryIndex(0)
    }
  }, [formData])

  const addHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ data: { ...formData }, time: new Date().toLocaleString(), action })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    addHistory(`修改${field}`)
  }

  const handleArrayItemChange = (array, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [array]: prev[array].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
    addHistory(`修改${array}[${index}].${field}`)
  }

  const addArrayItem = (array, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [array]: [...prev[array], defaultItem]
    }))
    addHistory(`添加${array}条目`)
  }

  const removeArrayItem = (array, index) => {
    setFormData(prev => ({
      ...prev,
      [array]: prev[array].filter((_, i) => i !== index)
    }))
    addHistory(`删除${array}[${index}]`)
  }

  const handleExportPDF = async () => {
    setExportStatus('generating')
    addHistory('导出PDF')

    setTimeout(() => {
      const element = document.getElementById('resume-preview')
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${formData.name || '简历'}_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      window.jspdf && window.jspdf.html2pdf()
      if (window.html2canvas) {
        window.html2canvas(element, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 0.98)
          const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4')
          const width = pdf.internal.pageSize.getWidth()
          const height = (canvas.height * width) / canvas.width
          let y = 0
          while (y < height) {
            pdf.addImage(imgData, 'JPEG', 0, -y, width, height)
            y += 297
            if (y < height) pdf.addPage()
          }
          pdf.save(opt.filename)
          setExportStatus('success')
          setTimeout(() => setExportStatus(''), 2000)
        })
      }
    }, 500)
  }

  const clearForm = () => {
    if (confirm('确定要清空所有数据吗？')) {
      setFormData(defaultFormData)
      addHistory('清空表单')
    }
  }

  const template = templateConfigs[selectedTemplate]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-800">简历生成器</h1>
          <p className="text-sm text-gray-500">填写信息 · 选择模板 · 导出PDF</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exportStatus === 'generating'}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              exportStatus === 'success'
                ? 'bg-green-500 text-white'
                : exportStatus === 'generating'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {exportStatus === 'success' ? '✓ 导出成功' : exportStatus === 'generating' ? '生成中...' : '导出PDF'}
          </button>
          <button
            onClick={clearForm}
            className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            清空
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-1/2 overflow-y-auto p-6 no-print">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择模板</label>
            <div className="flex gap-3">
              {Object.entries(templateConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedTemplate(key); addHistory(`切换模板: ${config.name}`) }}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    selectedTemplate === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Section title="基本信息">
              <div className="grid grid-cols-2 gap-4">
                <Input label="姓名" value={formData.name} onChange={v => handleInputChange('name', v)} placeholder="张三" />
                <Input label="性别" value={formData.gender} onChange={v => handleInputChange('gender', v)} placeholder="男/女" />
                <Input label="年龄" value={formData.age} onChange={v => handleInputChange('age', v)} placeholder="24" />
                <Input label="电话" value={formData.phone} onChange={v => handleInputChange('phone', v)} placeholder="152xxxx1234" />
                <Input label="邮箱" value={formData.email} onChange={v => handleInputChange('email', v)} placeholder="example@qq.com" />
                <Input label="所在地" value={formData.location} onChange={v => handleInputChange('location', v)} placeholder="福建福州" />
              </div>
            </Section>

            <Section title="教育背景">
              {formData.education.map((edu, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg mb-3 relative">
                  {i > 0 && (
                    <button onClick={() => removeArrayItem('education', i)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 px-2 py-1 rounded text-xs">删除</button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="学校" value={edu.school} onChange={v => handleArrayItemChange('education', i, 'school', v)} placeholder="厦门大学" />
                    <Input label="专业" value={edu.major} onChange={v => handleArrayItemChange('education', i, 'major', v)} placeholder="计算机科学与技术" />
                    <Input label="学历" value={edu.degree} onChange={v => handleArrayItemChange('education', i, 'degree', v)} placeholder="本科/硕士" />
                    <Input label="GPA" value={edu.GPA} onChange={v => handleArrayItemChange('education', i, 'GPA', v)} placeholder="3.8/4.0" />
                    <Input label="开始时间" value={edu.startDate} onChange={v => handleArrayItemChange('education', i, 'startDate', v)} placeholder="2020.09" />
                    <Input label="结束时间" value={edu.endDate} onChange={v => handleArrayItemChange('education', i, 'endDate', v)} placeholder="2024.06" />
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem('education', { school: '', major: '', degree: '', startDate: '', endDate: '', GPA: '' })}
                className="text-sm text-blue-600 hover:underline">+ 添加教育经历</button>
            </Section>

            <Section title="工作/实习经历">
              {formData.experience.map((exp, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg mb-3 relative">
                  {i > 0 && (
                    <button onClick={() => removeArrayItem('experience', i)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 px-2 py-1 rounded text-xs">删除</button>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="公司" value={exp.company} onChange={v => handleArrayItemChange('experience', i, 'company', v)} placeholder="字节跳动" />
                      <Input label="职位" value={exp.position} onChange={v => handleArrayItemChange('experience', i, 'position', v)} placeholder="前端开发实习生" />
                      <Input label="开始时间" value={exp.startDate} onChange={v => handleArrayItemChange('experience', i, 'startDate', v)} placeholder="2023.06" />
                      <Input label="结束时间" value={exp.endDate} onChange={v => handleArrayItemChange('experience', i, 'endDate', v)} placeholder="2023.09" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">工作内容</label>
                      <textarea value={exp.description} onChange={e => handleArrayItemChange('experience', i, 'description', e.target.value)}
                        placeholder="负责xxx，使用xxx技术，取得了xxx成果" rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '' })}
                className="text-sm text-blue-600 hover:underline">+ 添加经历</button>
            </Section>

            <Section title="项目经历">
              {formData.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg mb-3 relative">
                  {i > 0 && (
                    <button onClick={() => removeArrayItem('projects', i)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 px-2 py-1 rounded text-xs">删除</button>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="项目名称" value={proj.name} onChange={v => handleArrayItemChange('projects', i, 'name', v)} placeholder="在线简历生成器" />
                      <Input label="担任角色" value={proj.role} onChange={v => handleArrayItemChange('projects', i, 'role', v)} placeholder="前端开发" />
                      <Input label="开始时间" value={proj.startDate} onChange={v => handleArrayItemChange('projects', i, 'startDate', v)} placeholder="2024.01" />
                      <Input label="结束时间" value={proj.endDate} onChange={v => handleArrayItemChange('projects', i, 'endDate', v)} placeholder="2024.03" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">项目描述</label>
                      <textarea value={proj.description} onChange={e => handleArrayItemChange('projects', i, 'description', e.target.value)}
                        placeholder="项目背景、使用的技术、取得的成果" rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <Input label="技术栈" value={proj.technologies} onChange={v => handleArrayItemChange('projects', i, 'technologies', v)} placeholder="React, Tailwind, jsPDF" />
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem('projects', { name: '', role: '', startDate: '', endDate: '', description: '', technologies: '' })}
                className="text-sm text-blue-600 hover:underline">+ 添加项目</button>
            </Section>

            <Section title="技能证书">
              {formData.skills.map((skill, i) => (
                <div key={i} className="mb-3">
                  <Input label={skill.category} value={skill.items} onChange={v => {
                    const newSkills = [...formData.skills]
                    newSkills[i].items = v
                    setFormData(prev => ({ ...prev, skills: newSkills }))
                    addHistory(`修改技能: ${skill.category}`)
                  }} placeholder={`如: ${i === 0 ? 'JavaScript, Python' : i === 1 ? 'React, Vue' : 'Git, Docker'}`} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-600 mb-1">证书</label>
                <textarea value={formData.certificates} onChange={e => handleInputChange('certificates', e.target.value)}
                  placeholder="计算机二级、普通话证书等" rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </Section>

            {template.showSelfAssessment && (
              <Section title="自我评价">
                <textarea value={formData.selfAssessment} onChange={e => handleInputChange('selfAssessment', e.target.value)}
                  placeholder="认真负责、有较强的学习能力..." rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </Section>
            )}
          </div>
        </div>

        <div className="w-1/2 bg-gray-200 overflow-y-auto p-6 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-4 no-print">简历预览 · {template.name}</p>
          <div className="w-full max-w-[210mm] transform scale-[0.7] origin-top">
            <div id="resume-preview" className="bg-white shadow-xl">
              <SimpleTemplate data={formData} config={template} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-64 overflow-y-auto no-print">
        <h3 className="font-bold text-sm text-gray-700 mb-2">修改记录</h3>
        <div className="space-y-1">
          {history.slice(-10).reverse().map((item, i) => (
            <div key={i} className="text-xs text-gray-500">
              <span className="text-gray-400">{item.time.split(' ')[1]}</span> {item.action}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
    </div>
  )
}

function SimpleTemplate({ data, config }) {
  return (
    <div className="p-8" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: config.color }}>
      <div className="text-center mb-6">
        <h1 className={`font-bold ${config.fontSize.name} mb-2`}>{data.name || '姓名'}</h1>
        <div className={`${config.fontSize.body} text-gray-600 flex flex-wrap justify-center gap-2`}>
          {data.phone && <span>{data.phone}</span>}
          {data.email && <span>· {data.email}</span>}
          {data.location && <span>· {data.location}</span>}
        </div>
      </div>

      {data.education[0]?.school && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>教育背景</h2>
          <div className={`${config.fontSize.body} space-y-2`}>
            {data.education.filter(e => e.school).map((edu, i) => (
              <div key={i} className="flex justify-between">
                <span>{edu.school} · {edu.major} · {edu.degree}</span>
                <span className="text-gray-500">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.experience[0]?.company && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>工作经历</h2>
          <div className={`${config.fontSize.body} space-y-3`}>
            {data.experience.filter(e => e.company).map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="font-medium">{exp.company}</span>
                  <span className="text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-gray-600 ml-4 mt-1 whitespace-pre-line">{exp.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.projects[0]?.name && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>项目经历</h2>
          <div className={`${config.fontSize.body} space-y-3`}>
            {data.projects.filter(p => p.name).map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="font-medium">{proj.name}</span>
                  <span className="text-gray-500">{proj.startDate} - {proj.endDate}</span>
                </div>
                <div className="text-gray-600 ml-4 mt-1 whitespace-pre-line">{proj.description}</div>
                {proj.technologies && <div className="text-gray-400 ml-4 text-xs mt-1">技术栈: {proj.technologies}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills[0]?.items && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>专业技能</h2>
          <div className={`${config.fontSize.body}`}>
            {data.skills.filter(s => s.items).map((skill, i) => (
              <div key={i} className="mb-1"><span className="font-medium">{skill.category}：</span>{skill.items}</div>
            ))}
          </div>
        </div>
      )}

      {data.certificates && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>证书</h2>
          <div className={`${config.fontSize.body} text-gray-700`}>{data.certificates}</div>
        </div>
      )}

      {config.showSelfAssessment && data.selfAssessment && (
        <div className="mb-5">
          <h2 className={`${config.fontSize.section} font-bold ${config.accentColor} pb-1 border-b border-gray-200 mb-3`}>自我评价</h2>
          <div className={`${config.fontSize.body} text-gray-700 whitespace-pre-line`}>{data.selfAssessment}</div>
        </div>
      )}
    </div>
  )
}

export default App
