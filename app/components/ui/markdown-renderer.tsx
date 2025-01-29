'use client';

import React, { Suspense, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from 'isomorphic-dompurify';
import { Skeleton } from "@/app/components/ui/skeleton";

interface MarkdownRendererProps {
  markdownUrl: string;
}

function MarkdownContent({ markdownUrl }: MarkdownRendererProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        console.log(markdownUrl);
        const response = await fetch(markdownUrl);
        if (!response.ok) throw new Error('Failed to load Markdown content.');
        const text = await response.text();
        setHtml(DOMPurify.sanitize(await marked.parse(text)));
      } catch (error) {
        console.error('Error loading markdown:', error);
      }
    };

    fetchMarkdown();
  }, [markdownUrl]);

  return <div
    className="prose dark:prose-invert max-w-none"
    dangerouslySetInnerHTML={{ __html: html }}
  />
}


function Loader() {
  return (
    <div className="space-y-6">
      < Skeleton className="h-8 w-4/5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
      </div>
    </div >
  );
}

export default function MarkdownRenderer({ markdownUrl }: MarkdownRendererProps) {
  return (
    <Suspense fallback={<Loader />}>
      <MarkdownContent markdownUrl={markdownUrl} />
    </Suspense>
  );
}

