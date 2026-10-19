import { useEffect, useRef, useState } from "react";

/**
 * 滚动进入视口时触发动画
 * @param threshold 触发阈值（0-1），默认 0.1
 * @param once 是否只触发一次，默认 true
 */
export function useInView(threshold = 0.1, once = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, isVisible };
}

/**
 * 动画入场组件
 * 包裹任意内容，进入视口时触发 CSS 动画
 * 首屏默认可见：未触发 IntersectionObserver 时不再设 opacity-0，避免隐形黑屏等待
 */
export function AnimateIn({
  children,
  animation = "animate-fade-in-up",
  delay = "",
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  animation?: string;
  delay?: string;
  className?: string;
  as?: React.ElementType;
}) {
  const { ref, isVisible } = useInView(0.08);

  return (
    <Tag
      ref={ref}
      className={`${isVisible ? animation : ""} ${delay} ${className}`}
      style={{ willChange: isVisible ? "auto" : "transform, opacity" }}
    >
      {children}
    </Tag>
  );
}
