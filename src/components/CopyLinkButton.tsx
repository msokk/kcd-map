import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  url: string;
  /** Translation key for the default label ("copylink" or "share"). */
  labelKey?: string;
}

export default function CopyLinkButton({ url, labelKey = 'copylink' }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers without async clipboard access.
      const temp = document.createElement('input');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button type="button" className="copymarkerurl" onClick={onClick}>
      {copied ? (
        <span className="copiedmsg">{t('copied')}</span>
      ) : (
        <span className="sharetext">{t(labelKey)}</span>
      )}
    </button>
  );
}
