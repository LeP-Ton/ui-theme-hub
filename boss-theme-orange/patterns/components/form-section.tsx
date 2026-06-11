/**
 * Boss 橙色主题 - 表单区块组件
 * 含输入框、选择器、按钮的标准表单布局，适用于管理后台
 * 使用 boss-theme-orange tokens：primary=#ff6600
 */
import React from 'react';

interface FormField {
  label: string;
  type: 'input' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
}

interface FormSectionProps {
  title?: string;
  fields?: FormField[];
}

const defaultFields: FormField[] = [
  { label: '项目名称', type: 'input', placeholder: '请输入项目名称' },
  { label: '所属部门', type: 'select', options: ['技术部', '产品部', '设计部', '运营部'] },
  { label: '负责人', type: 'input', placeholder: '请输入负责人姓名' },
  { label: '优先级', type: 'select', options: ['低', '中', '高', '紧急'] },
  { label: '备注说明', type: 'textarea', placeholder: '请输入备注信息' },
];

const FormSection: React.FC<FormSectionProps> = ({
  title = '新建项目',
  fields = defaultFields,
}) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.form}>
        {fields.map((field, i) => (
          <div key={i} style={field.type === 'textarea' ? styles.fieldFull : styles.field}>
            <label style={styles.label}>{field.label}</label>
            {field.type === 'input' && (
              <input style={styles.input} placeholder={field.placeholder} />
            )}
            {field.type === 'select' && (
              <select style={styles.select}>
                <option>请选择</option>
                {field.options?.map(opt => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === 'textarea' && (
              <textarea style={styles.textarea} placeholder={field.placeholder} rows={3} />
            )}
          </div>
        ))}
      </div>
      <div style={styles.actions}>
        <button style={styles.submitBtn}>提交</button>
        <button style={styles.cancelBtn}>取消</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#ffffff',
    borderRadius: 6,
    padding: 24,
    maxWidth: 720,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid #f0f0f0',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  fieldFull: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.88)',
  },
  input: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    fontSize: 14,
    outline: 'none',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    fontSize: 14,
    background: '#ffffff',
    outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid #f0f0f0',
  },
  submitBtn: {
    padding: '8px 24px',
    borderRadius: 6,
    border: 'none',
    background: '#ff6600',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 24px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    background: '#ffffff',
    fontSize: 14,
    cursor: 'pointer',
  },
};

export default FormSection;
