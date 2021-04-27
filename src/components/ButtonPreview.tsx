import Link from 'next/link';

import commonStyles from '../styles/common.module.scss';

interface ButtonPreviewProps {
  preview: boolean;
}

export function ButtonPreview({ preview }: ButtonPreviewProps) {
  return (
    <>
      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a className={commonStyles.preview}>Sair do modo preview</a>
          </Link>
        </aside>
      )}
    </>
  );
}
