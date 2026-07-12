export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">关于本站</h1>
      
      <div className="card space-y-4 text-slate-600 text-sm leading-relaxed">
        <p>
          公基备考是一个面向公务员考试、事业单位考试考生提供的<strong>公共基础知识</strong>在线学习平台。
        </p>
        
        <h2 className="text-lg font-bold text-slate-900 mt-6">功能</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>知识库</strong>：按学科-章节浏览考点知识</li>
          <li><strong>章节刷题</strong>：按学科章节进行专项练习</li>
          <li><strong>模拟考试</strong>：限时套卷模拟真实考试</li>
          <li><strong>错题本</strong>：自动收集错题，反复复习</li>
        </ul>

        <h2 className="text-lg font-bold text-slate-900 mt-6">数据存储</h2>
        <p>
          所有做题记录和错题数据均存储在<strong>浏览器本地</strong>，不会上传到任何服务器。
          这意味着：
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>无需注册账号</li>
          <li>无需联网即可使用</li>
          <li>换设备或清除浏览器数据后记录会丢失</li>
        </ul>

        <h2 className="text-lg font-bold text-slate-900 mt-6">免责声明</h2>
        <p>
          本站内容仅供学习参考，不构成任何考试指导。所有内容均来源于公开信息，
          请以官方发布的最新考试大纲和教材为准。如发现内容有误，欢迎指正。
        </p>
      </div>
    </div>
  );
}
