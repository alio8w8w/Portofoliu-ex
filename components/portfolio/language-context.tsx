"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Locale = "en" | "ro" | "ru"

const copy = {
  en: {
    nav: { about: "About", work: "Selected work", services: "Services", contact: "Contact", cta: "Let’s talk", menu: "Open menu", close: "Close menu", explore: "Explore", content: { projects: "Projects", travels: "Travel", vlogs: "Vlogs", thoughts: "Thoughts", tutorials: "Tutorials", progress: "Progress" } },
    hero: {
      eyebrow: "Biomedical engineering × web development",
      title: "Curious by nature,\ncreative by design.",
      intro: "I’m Ilina — a biomedical engineering master’s student who turns big ideas into thoughtful, bright digital experiences.",
      primary: "Let’s make something",
      secondary: "Explore my work",
      sticker: "science brain,\ncreative heart",
      note: "Based in Chișinău, Moldova",
      scroll: "A little more about me",
    },
    about: {
      eyebrow: "A little about me",
      title: "Part science.\nPart pixels.\nFully curious.",
      body: "I’m a master’s student in Biomedical Engineering at the Technical University of Moldova, and a self-taught web developer with a soft spot for ideas that make people feel something.",
      bodyTwo: "I challenged myself to become a programmer in 30 days on TikTok. Now I’m building on that momentum, growing my English every day, and taking my Polaroid 300AF along for the ride.",
      note: "Always learning, always making.",
      facts: ["Biomedical Engineering MSc · UTM", "30 days of code, shared on TikTok", "Film photos on a Polaroid 300AF"],
      currently: "Currently into",
      currentlyValue: "good interfaces, better questions & film grain",
    },
    work: {
      eyebrow: "A few things I’ve made",
      title: "Small ideas,\nbig personality.",
      intro: "A mix of web experiments, visual concepts and little moments from my 30-day coding challenge.",
      concept: "Concept study",
      challenge: "30-day challenge",
      editorial: "Visual exploration",
      projectOne: "Good Mood Market",
      projectOneDesc: "A bright, friendly landing page concept for a feel-good little shop.",
      projectOneTag: "Web design · Concept",
      projectTwo: "Becoming a programmer",
      projectTwoDesc: "Tiny lessons, honest progress and a whole lot of learning in public.",
      projectTwoTag: "TikTok · 30 days",
      projectThree: "Soft Science",
      projectThreeDesc: "A playful editorial direction bringing the worlds of biology and design together.",
      projectThreeTag: "Art direction · Study",
      view: "Explore",
      challengeCta: "Find me on TikTok",
    },
    services: {
      eyebrow: "Ways we can work together",
      title: "Good things start\nwith a hello.",
      intro: "Need a thoughtful digital home, an extra pair of hands on the web, or a creative voice for your next idea? I’d love to hear about it.",
      items: [
        { number: "01", title: "Website creation", text: "Warm, memorable websites that make your next step feel obvious." },
        { number: "02", title: "Web development", text: "Responsive, accessible frontends made with care and curiosity." },
        { number: "03", title: "Content creation", text: "Short-form storytelling that makes the process as fun as the result." },
      ],
      cta: "Tell me what you’re dreaming up",
    },
    contact: {
      eyebrow: "Your turn",
      title: "Have a good\none in mind?",
      intro: "Tell me a little about it. I’m open to collaborations, freelance projects and kind internet introductions.",
      name: "Your name",
      namePlaceholder: "The name your friends use",
      email: "Your email",
      emailPlaceholder: "you@example.com",
      service: "I’m interested in",
      choose: "Choose a starting point",
      message: "A little about your idea",
      messagePlaceholder: "What are you hoping to make?",
      send: "Send a little hello",
      privacy: "Your note opens in your email app so you can review it before sending.",
      success: "Your email app is ready with your note. Add Ilina’s email address and send when you’re ready.",
      social: "Find me around the internet",
      emailFallback: "Prefer email? Start a message",
      footer: "Made with curiosity & a little extra color.",
      top: "Back to top",
      serviceOptions: ["Website creation", "Web development", "Content creation", "Something else"],
    },
  },
  ro: {
    nav: { about: "Despre mine", work: "Proiecte", services: "Servicii", contact: "Contact", cta: "Hai să vorbim", menu: "Deschide meniul", close: "Închide meniul", explore: "Mai multe", content: { projects: "Portofoliu", travels: "Călătorii", vlogs: "Vloguri", thoughts: "Gânduri", tutorials: "Tutoriale", progress: "Progres" } },
    hero: {
      eyebrow: "Inginerie biomedicală × dezvoltare web",
      title: "Curioasă din fire,\ncreativă prin design.",
      intro: "Sunt Ilina — studentă la master în inginerie biomedicală, pasionată să transform ideile mari în experiențe digitale pline de personalitate.",
      primary: "Hai să creăm ceva",
      secondary: "Descoperă proiectele",
      sticker: "minte de știință,\ninimă creativă",
      note: "Din Chișinău, Moldova",
      scroll: "Puțin mai multe despre mine",
    },
    about: {
      eyebrow: "Câte ceva despre mine",
      title: "Puțină știință.\nPuțini pixeli.\nMultă curiozitate.",
      body: "Sunt masterandă în Inginerie Biomedicală la Universitatea Tehnică a Moldovei și dezvoltatoare web autodidactă, atrasă de ideile care trezesc emoții.",
      bodyTwo: "Mi-am propus să devin programatoare în 30 de zile pe TikTok. Acum continui cu aceeași energie, îmi îmbunătățesc engleza zi de zi și iau cu mine aparatul Polaroid 300AF.",
      note: "Învăț mereu, creez mereu.",
      facts: ["Master în Inginerie Biomedicală · UTM", "30 de zile de programare, pe TikTok", "Fotografii pe film cu Polaroid 300AF"],
      currently: "În perioada asta",
      currentlyValue: "interfețe bune, întrebări mai bune și granulație foto",
    },
    work: {
      eyebrow: "Câteva lucruri create de mine",
      title: "Idei mici,\npersonalitate mare.",
      intro: "Un amestec de experimente web, concepte vizuale și momente din provocarea mea de 30 de zile de programare.",
      concept: "Studiu de concept",
      challenge: "Provocare de 30 de zile",
      editorial: "Explorare vizuală",
      projectOne: "Good Mood Market",
      projectOneDesc: "Un concept de pagină luminoasă și prietenoasă pentru un mic magazin cu produse care aduc bucurie.",
      projectOneTag: "Design web · Concept",
      projectTwo: "Devenind programatoare",
      projectTwoDesc: "Lecții scurte, progres sincer și multă învățare în public.",
      projectTwoTag: "TikTok · 30 de zile",
      projectThree: "Soft Science",
      projectThreeDesc: "O direcție editorială jucăușă, la întâlnirea dintre biologie și design.",
      projectThreeTag: "Art direction · Studiu",
      view: "Descoperă",
      challengeCta: "Găsește-mă pe TikTok",
    },
    services: {
      eyebrow: "Cum putem lucra împreună",
      title: "Lucrurile bune\nîncep cu un salut.",
      intro: "Ai nevoie de un spațiu digital cu personalitate, de ajutor în dezvoltarea web sau de o voce creativă pentru următoarea idee? Povestește-mi.",
      items: [
        { number: "01", title: "Creare website", text: "Site-uri calde și memorabile, care fac următorul pas ușor de găsit." },
        { number: "02", title: "Dezvoltare web", text: "Interfețe responsive și accesibile, construite cu grijă și curiozitate." },
        { number: "03", title: "Creare de conținut", text: "Povești scurte care fac procesul la fel de interesant ca rezultatul." },
      ],
      cta: "Spune-mi ce idee ai",
    },
    contact: {
      eyebrow: "Acum e rândul tău",
      title: "Ai o idee\nfrumoasă?",
      intro: "Povestește-mi puțin despre ea. Sunt deschisă la colaborări, proiecte freelance și întâlniri frumoase pe internet.",
      name: "Numele tău",
      namePlaceholder: "Cum îți spun prietenii",
      email: "Adresa ta de email",
      emailPlaceholder: "tu@exemplu.com",
      service: "Sunt interesat(ă) de",
      choose: "Alege de unde să începem",
      message: "Câteva cuvinte despre idee",
      messagePlaceholder: "Ce ți-ar plăcea să creăm?",
      send: "Trimite un salut",
      privacy: "Mesajul se deschide în aplicația ta de email ca să îl poți verifica înainte de trimitere.",
      success: "Aplicația de email este pregătită cu mesajul tău. Adaugă adresa Ilinei și trimite când dorești.",
      social: "Mă găsești și pe internet",
      emailFallback: "Preferi emailul? Începe un mesaj",
      footer: "Creată cu multă curiozitate și puțină culoare în plus.",
      top: "Înapoi sus",
      serviceOptions: ["Creare website", "Dezvoltare web", "Creare de conținut", "Altceva"],
    },
  },
  ru: {
    nav: { about: "Обо мне", work: "Проекты", services: "Услуги", contact: "Контакты", cta: "Давайте обсудим", menu: "Открыть меню", close: "Закрыть меню", explore: "Ещё", content: { projects: "Портфолио", travels: "Путешествия", vlogs: "Влоги", thoughts: "Мысли", tutorials: "Уроки", progress: "Прогресс" } },
    hero: {
      eyebrow: "Биомедицинская инженерия × веб-разработка",
      title: "Любопытная по натуре,\nтворческая по дизайну.",
      intro: "Я Илина — магистрантка в области биомедицинской инженерии, превращаю большие идеи в продуманные и яркие цифровые впечатления.",
      primary: "Давайте создадим что-то",
      secondary: "Смотреть проекты",
      sticker: "ум учёного,\nдуша творца",
      note: "Кишинёв, Молдова",
      scroll: "Немного обо мне",
    },
    about: {
      eyebrow: "Немного обо мне",
      title: "Немного науки.\nНемного пикселей.\nМного любопытства.",
      body: "Я учусь в магистратуре по биомедицинской инженерии в Техническом университете Молдовы и самостоятельно осваиваю веб-разработку. Люблю идеи, которые вызывают эмоции.",
      bodyTwo: "Я прошла челлендж «стать программистом за 30 дней» в TikTok. Теперь продолжаю развиваться, каждый день улучшаю английский и беру с собой Polaroid 300AF.",
      note: "Всегда учусь, всегда создаю.",
      facts: ["Магистратура по биомедицинской инженерии · UTM", "30 дней программирования в TikTok", "Плёночные фото на Polaroid 300AF"],
      currently: "Сейчас мне интересно",
      currentlyValue: "хорошие интерфейсы, важные вопросы и плёночное зерно",
    },
    work: {
      eyebrow: "Несколько моих работ",
      title: "Небольшие идеи,\nбольшой характер.",
      intro: "Веб-эксперименты, визуальные концепции и моменты из моего 30-дневного челленджа по программированию.",
      concept: "Концептуальный проект",
      challenge: "Челлендж · 30 дней",
      editorial: "Визуальное исследование",
      projectOne: "Good Mood Market",
      projectOneDesc: "Яркая и дружелюбная концепция лендинга для небольшого магазина хорошего настроения.",
      projectOneTag: "Веб-дизайн · Концепция",
      projectTwo: "Становлюсь программистом",
      projectTwoDesc: "Короткие уроки, честный прогресс и много открытого обучения.",
      projectTwoTag: "TikTok · 30 дней",
      projectThree: "Soft Science",
      projectThreeDesc: "Игривая редакционная концепция на стыке биологии и дизайна.",
      projectThreeTag: "Арт-дирекшн · Исследование",
      view: "Смотреть",
      challengeCta: "Найти меня в TikTok",
    },
    services: {
      eyebrow: "Как мы можем поработать вместе",
      title: "Хорошее начинается\nс приветствия.",
      intro: "Нужен яркий цифровой дом, помощь с веб-разработкой или творческий взгляд на вашу идею? Буду рада услышать о ней.",
      items: [
        { number: "01", title: "Создание сайта", text: "Тёплые и запоминающиеся сайты, которые подсказывают следующий шаг." },
        { number: "02", title: "Веб-разработка", text: "Адаптивные и доступные интерфейсы, созданные с вниманием и интересом." },
        { number: "03", title: "Создание контента", text: "Короткие истории, которые делают процесс таким же интересным, как результат." },
      ],
      cta: "Расскажите о своей идее",
    },
    contact: {
      eyebrow: "Теперь ваша очередь",
      title: "Есть хорошая\nидея?",
      intro: "Расскажите мне о ней. Я открыта к сотрудничеству, фриланс-проектам и приятным знакомствам в интернете.",
      name: "Ваше имя",
      namePlaceholder: "Как вас называют друзья",
      email: "Ваш email",
      emailPlaceholder: "you@example.com",
      service: "Меня интересует",
      choose: "Выберите направление",
      message: "Немного о вашей идее",
      messagePlaceholder: "Что вы хотите создать?",
      send: "Отправить привет",
      privacy: "Сообщение откроется в почтовом приложении, чтобы вы могли проверить его перед отправкой.",
      success: "Почтовое приложение открылось с готовым сообщением. Добавьте адрес Илины и отправьте, когда будете готовы.",
      social: "Я есть и в интернете",
      emailFallback: "Предпочитаете email? Напишите мне",
      footer: "Создано с любопытством и чуточкой ярких красок.",
      top: "Наверх",
      serviceOptions: ["Создание сайта", "Веб-разработка", "Создание контента", "Другое"],
    },
  },
} as const

type Widen<T> = T extends string ? string : T extends readonly (infer Item)[] ? readonly Widen<Item>[] : T extends object ? { [Key in keyof T]: Widen<T[Key]> } : T

export type SiteCopy = Widen<typeof copy.en>

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: SiteCopy
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <LanguageContext.Provider value={{ locale, setLocale, copy: copy[locale] }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
