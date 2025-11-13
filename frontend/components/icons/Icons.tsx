/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-13 12:33:08
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-13 14:21:11
 * @FilePath: /wcl_analyze/frontend/components/icons/Icons.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import React from 'react';

export const WowIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .9l-11.1 6.3v6.3L12 23.1l11.1-9.6v-6.3L12 .9zm-8.8 7.4l2.1 1.2v4l-2.1-1.2v-4zm2.1 6.3l4.4 2.5v-5l-4.4-2.5v5zm-2.1-5.1l6.5-3.7 6.5 3.7-6.5 3.8-6.5-3.8zm11.1 5.1l-4.4 2.5v-5l4.4-2.5v5zm2.1-6.3l-2.1 1.2v4l2.1-1.2v-4z" />
  </svg>
);

export const GithubIcon: React.FC<{className?: string}> = ({ className }) => (
  <img 
    src="/images/logo.jpg" 
    alt="WCL Logo" 
    className={className}
  />
);
