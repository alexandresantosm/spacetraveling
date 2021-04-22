/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../util/format';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce(
    (summedContents, currentContent) => {
      const headingWords = currentContent.heading.split(/\s/g).length;

      summedContents += headingWords;

      const bodyWords = currentContent.body.reduce(
        (summedBody, currentBody) => {
          const words = currentBody.text.split(/\s/g).length;
          summedBody += words;
          return summedBody;
        },
        0
      );

      summedContents += bodyWords;

      return summedContents;
    },
    0
  );

  const wordPerMinutes = 200;

  const readingTime = Math.ceil(totalWords / wordPerMinutes);

  const dateFormatted = formatDate(post.first_publication_date);

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>
      <Header />

      <img
        src={post.data.banner.url}
        alt={post.data.title}
        className={styles.banner}
      />

      <main className={commonStyles.container}>
        <section className={styles.heading}>
          <h1>{post.data.title}</h1>

          <ul>
            <li style={{ textTransform: 'capitalize' }}>
              <FiCalendar size={15} />
              {dateFormatted}
            </li>
            <li>
              <FiUser size={15} />
              {post.data.author}
            </li>
            <li>
              <FiClock size={15} />
              {`${readingTime} min`}
            </li>
          </ul>
        </section>

        {post.data.content.map(content => {
          return (
            <article className={styles.content} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
