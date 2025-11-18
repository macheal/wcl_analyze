/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-19 10:00:00
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-19 10:00:00
 * @FilePath: /wcl_analyze/frontend/components/SearchableDropdown.tsx
 * @Description: 支持搜索功能的下拉框组件
 */
import React, { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps<T> {
  value: T | null | undefined;
  onChange: (value: T | null | undefined) => void;
  options: T[];
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  className?: string;
  noOptionsMessage?: string;
}

export function SearchableDropdown<T>({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = '请选择',
  loading = false,
  getOptionLabel,
  getOptionValue,
  className = '',
  noOptionsMessage = '未找到选项'
}: SearchableDropdownProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 过滤选项
  const filteredOptions = searchTerm
    ? options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // 关闭下拉框的处理函数
  const handleClose = () => {
    setIsOpen(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 处理选项点击
  const handleOptionClick = (option: T) => {
    onChange(option);
    handleClose();
    setSearchTerm('');
  };

  // 获取当前选中的值文本
  const selectedValueText = value ? getOptionLabel(value) : '';

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full max-w-sm ${className}`}
    >
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : selectedValueText}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClose();
              setSearchTerm('');
            }
          }}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          )}
        </div>
      </div>

      {isOpen && !loading && (
        <div className="absolute z-10 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={getOptionValue(option)}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors ${value && getOptionValue(value) === getOptionValue(option) ? 'bg-gray-700 font-medium' : ''}`}
              >
                {getOptionLabel(option)}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">{noOptionsMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}