"use client";

import Image from "next/image";
import type { Project } from "@/data/projects";

export function ProjectVisual({ project }: { project: Project }) {
  if (project.status === "published")
    return (
      <Image
        src={project.thumbnail}
        alt={project.title}
        fill
        sizes="(max-width: 700px) 100vw, 60vw"
        className="project-image"
      />
    );
  return (
    <div className={`project-art art-${project.visual}`} aria-hidden="true">
      <span className="art-label">{project.category} / presentation study</span>
      {(project.visual === "web" ||
        project.visual === "brand" ||
        project.visual === "commerce") && (
        <div className="browser-study">
          <div className="browser-bar">
            <i />
            <i />
            <i />
            <span>EXPERIENCE, CONSIDERED.</span>
          </div>
          <div className="browser-content">
            <span className="study-index">
              {project.visual === "web"
                ? "THE DIGITAL EDITION"
                : project.visual === "commerce"
                  ? "A CONSIDERED COLLECTION"
                  : "FORM & FEELING"}
            </span>
            <span className="study-title">
              {project.visual === "web" ? (
                <>
                  Less noise.
                  <br />
                  <em>More presence.</em>
                </>
              ) : project.visual === "commerce" ? (
                <>
                  Objects.
                  <br />
                  <em>With purpose.</em>
                </>
              ) : (
                <>
                  Make your
                  <br />
                  <em>own mark.</em>
                </>
              )}
            </span>
            <span className="study-bottom">
              A new perspective <span>↗</span>
            </span>
          </div>
        </div>
      )}
      {(project.visual === "workflow" || project.visual === "system") && (
        <div className="workflow-art">
          <div className="workflow-node">
            <span>01</span>
            {project.visual === "system" ? "Your knowledge" : "New enquiry"}
          </div>
          <div className="workflow-wire">
            <i />
          </div>
          <div className="workflow-node node-main">
            <span>✳</span>
            {project.visual === "system"
              ? "Intelligence layer"
              : "AI qualification"}
          </div>
          <div className="workflow-wire">
            <i />
          </div>
          <div className="workflow-branches">
            <div className="workflow-node">
              {project.visual === "system" ? "Useful answer" : "Your CRM"}
            </div>
            <div className="workflow-node">
              {project.visual === "system" ? "Next action" : "Your team"}
            </div>
          </div>
        </div>
      )}
      {project.visual === "chat" && (
        <div className="chat-study">
          <div className="chat-header">
            <span className="chat-star">✳</span>
            <div>
              A helpful first hello.<small>Conversation study</small>
            </div>
          </div>
          <div className="chat-bubble outgoing">
            I have a question about your services.
          </div>
          <div className="chat-bubble incoming">
            Of course. What are you hoping to build?
          </div>
          <div className="chat-options">
            <span>A website</span>
            <span>An AI workflow</span>
          </div>
          <div className="chat-input">
            A better conversation starts here <span>↗</span>
          </div>
        </div>
      )}
      <span className="art-number">
        0{project.id.split("-")[1]?.replace(/^0/, "")}
      </span>
    </div>
  );
}
