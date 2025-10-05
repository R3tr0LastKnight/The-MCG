import { useEffect, useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";

const TargetCursor = ({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);

  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12,
      parallaxStrength: 0.05, // much higher for visible effect
    }),
    []
  );

  // main move handler
  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.08, // faster
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll(".target-cursor-corner");

    let activeTarget = null;
    let currentTargetMove = null;
    let currentLeaveHandler = null;

    // initial position
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    // spinning animation
    const createSpinTimeline = () => {
      spinTl.current?.kill();
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursor, {
        rotation: "+=360",
        duration: spinDuration,
        ease: "none",
      });
    };
    createSpinTimeline();

    // follow mouse
    const moveHandler = (e) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    // click scaling
    const mouseDownHandler = () => {
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.15 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.15 });
    };
    const mouseUpHandler = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.15 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.15 });
    };
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    // when entering a target element
    const enterHandler = (e) => {
      const target = e.target.closest(targetSelector);
      if (!target || target === activeTarget) return;

      // cleanup old
      if (activeTarget) {
        if (currentTargetMove)
          activeTarget.removeEventListener("mousemove", currentTargetMove);
        if (currentLeaveHandler)
          activeTarget.removeEventListener("mouseleave", currentLeaveHandler);
      }

      activeTarget = target;
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      const updateCorners = (mouseX, mouseY) => {
        if (!cornersRef.current) return;
        const rect = target.getBoundingClientRect();
        const { borderWidth, cornerSize, parallaxStrength } = constants;

        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;

        const offsetX = (mouseX - targetCenterX) * parallaxStrength;
        const offsetY = (mouseY - targetCenterY) * parallaxStrength;

        const positions = [
          {
            x: rect.left - targetCenterX - borderWidth + offsetX,
            y: rect.top - targetCenterY - borderWidth + offsetY,
          },
          {
            x: rect.right - targetCenterX + borderWidth - cornerSize + offsetX,
            y: rect.top - targetCenterY - borderWidth + offsetY,
          },
          {
            x: rect.right - targetCenterX + borderWidth - cornerSize + offsetX,
            y: rect.bottom - targetCenterY + borderWidth - cornerSize + offsetY,
          },
          {
            x: rect.left - targetCenterX - borderWidth + offsetX,
            y: rect.bottom - targetCenterY + borderWidth - cornerSize + offsetY,
          },
        ];

        gsap.to(cornersRef.current, {
          x: (i) => positions[i].x,
          y: (i) => positions[i].y,
          duration: 0.12, // much faster
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const targetMove = (ev) => updateCorners(ev.clientX, ev.clientY);
      const leaveHandler = () => {
        activeTarget = null;
        gsap.to(cornersRef.current, {
          x: (i) => [-18, 6, 6, -18][i],
          y: (i) => [-18, -18, 6, 6][i],
          duration: 0.2,
          ease: "power3.out",
        });
        spinTl.current?.resume();
      };

      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;
      target.addEventListener("mousemove", targetMove);
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener("mouseover", enterHandler);
      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999] mix-blend-difference hidden lg:flex"
    >
      <div
        ref={dotRef}
        className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
      />
      <div className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0" />
      <div className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0" />
      <div className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 translate-y-1/2 border-l-0 border-t-0" />
      <div className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0" />
    </div>
  );
};

export default TargetCursor;
