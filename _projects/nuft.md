---
layout: page
title: Northwestern Fintech Club
description: Developing a sustainable architecture for high-frequency trading.
img: assets/img/nuft.png
importance: 1
category: personal
giscus_comments: true
---

## What is NUFT?

<blockquote class="mb-1 mt-3">
    <p class="my-0">
        Northwestern University’s premier quant finance and software development 
        club. At NUFT, we aim to improve the quality of the Fintech and Quant 
        education at Northwestern, as well as to provide an excellent 
        pre-professional space for students to engage and discuss. We seek to help
        students prepare for some of the most competitive roles in industry by 
        providing experiences and projects that would be impossible for an 
        individual.
    </p>
</blockquote>

*Taken from their website, [https://nu-fintech.web.app/](https://nu-fintech.web.app/).*

<div class="mb-1" /> <!-- padding -->

## My role at NUFT

<p class="mb-0">
    At NUFT, my role is, first and foremost, like a software engineer. For the 
    most part, I am writing code, mainly in C++, to build up a new infrastructure
    for the coming years. However, as we are <strong>rebuilding</strong>, we want to avoid the
    same pitfalls that occurred in our previous infrastructure, especially when in
    comes to technical debt. Thus, while I am primarily writing code, I am also 
    ensuring the maintainability of all future code by doing the following:
</p>

- Using tools such as [Poetry](https://python-poetry.org) and [Conan](https://conan.io) to create
  reproducible builds.
- Enabling automatic checks using [Github Actions CI/CD](https://actions.github.com).
- Lending a hand in reviewing pull requests with a close eye for reducing technical debt.
- Improving overall operating procedures for the future.

Currently, my main project is [Raccoon](https://github.com/northwesternfintech/raccoon),
an in-house orderbook solution to aggregate and distribute orderbooks using Redis.
It is written in C++, using [libcurl](https://github.com/curl/curl) for performing
web requests (incl. websocket connections), [hiredis](https://github.com/redis/hiredis)
for connecting to Redis, [libuv](https://github.com/libuv/libuv) as an event loop
for managing connections and ports, and [glaze](https://github.com/stephenberry/glaze)
as a JSON parser.

Additionally, I am also performing pull requests reviews across all repos, 
looking our for common mistakes that can lead to large amounts of technical
debt, such as passing around untyped dictionaries in Python instead of classes.
I am also currently setting up a linting system for our Python projects using
[ruff](https://github.com/astral-sh/ruff) and [mypy](https://github.com/python/mypy)
for static analysis, running in Github Actions with Poetry for reproducible builds.
I have also set up all our C++ projects with [quill](https://github.com/odygrd/quill)
for logging, Conan for reproducible builds, testing in Github Actions using
[GoogleTest](https://github.com/google/googletest), and linting using 
[clang-tidy](https://clang.llvm.org/extra/clang-tidy/).

With these goals and a close eye to detail, I plan to help create a sustainable
architecture with minimal technical debt for NUFT to use over the coming years.
