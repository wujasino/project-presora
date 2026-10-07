import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const STYLE_BLOCK = `<style>.legal-doc a { color: #6366F1; } .legal-doc a:hover { color: #4F46E5; } @media (max-width: 640px) { .legal-doc, .legal-doc table { display: block !important; width: 100% !important; max-width: 100% !important; } .legal-doc tr, .legal-doc thead, .legal-doc tbody { display: block !important; width: 100% !important; } .legal-doc td, .legal-doc th { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: left !important; } .legal-doc svg { width: 40px !important; height: 40px !important; } }</style>`;

const ICON_ROWSPAN2 = (svg: string) =>
  `<td rowspan="2" style="border:1px solid #334155;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#111827;color:#6366F1;padding-top:40px;">${svg}</td>`;

const PL_HTML = `
${STYLE_BLOCK}
<table class="legal-doc" style="width:85%;border-collapse:collapse;margin-left:auto;margin-right:auto;font-family:sans-serif;font-size:12pt;">

  <!-- NAGŁÓWEK -->
  <tr style="border:1px solid #334155;">
    <th colspan="2" style="border:1px solid #334155;padding:8px;padding-top:20px;font-size:18px;line-height:40px;background-color:#1E293B;color:#F8FAFC;text-align:center;">
      Regulamin strony internetowej<br>
      Presora PL („Regulamin")<br>
      <small style="font-size:14px;font-weight:normal;">Dokument z dnia: 18.06.2026</small>
    </th>
  </tr>

  <!-- DEFINICJE -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 21V7C12 5.89543 12.8954 5 14 5H21.4C21.7314 5 22 5.26863 22 5.6V18.7143" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M12 21V7C12 5.89543 11.1046 5 10 5H2.6C2.26863 5 2 5.26863 2 5.6V18.7143" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M14 19L22 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M10 19L2 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M12 21C12 19.8954 12.8954 19 14 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 21C12 19.8954 11.1046 19 10 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">DEFINICJE</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p><strong>Strona internetowa</strong></p>
      <p>Serwis internetowy <strong>Presora PL</strong>, dostępny pod adresem <strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">www.presora.app</a></strong>, prowadzony przez Usługodawcę.</p>
      <p><strong>Usługodawca</strong></p>
      <p>Patryk Rybacki<br>działalność nierejestrowana<br>Biskupia 7/2</p>
      <p>Kiedy w Regulaminie użyte są takie zwroty jak „my", „nasz", „nami" itp. należy przez to rozumieć Usługodawcę.</p>
      <p><strong>Usługobiorca</strong></p>
      <p>Każdy podmiot korzystający ze Strony internetowej, w tym z usług na niej dostępnych.</p>
      <p><strong>Konsument</strong></p>
      <p>Usługobiorca będący osobą fizyczną, korzystający ze Strony internetowej bez bezpośredniego związku z jego działalnością gospodarczą lub zawodową.</p>
      <p><strong>Przedsiębiorca uprzywilejowany</strong></p>
      <p>Usługobiorca, który jest osobą fizyczną zawierającą na podstawie Regulaminu umowę (lub podejmującą czynności zmierzające do zawarcia tej umowy), bezpośrednio związaną z jej działalnością gospodarczą, ale nieposiadającą dla niej charakteru zawodowego.</p>
      <p><strong>Usługobiorca uprzywilejowany</strong></p>
      <p>Usługobiorca, który jest Konsumentem lub Przedsiębiorcą uprzywilejowanym.</p>
    </td>
  </tr>

  <!-- PUNKT KONTAKTOWY -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M7 9L12 12.5L17 9" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" stroke="#6366F1" stroke-width="1.5"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">PUNKT KONTAKTOWY</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>W celu kontaktowania się z nami możesz skorzystać z następujących form komunikacji elektronicznej:</p>
      <ul>
        <li>poczta elektroniczna: <strong>contact.presora@gmail.com</strong></li>
        <li>formularz kontaktowy dostępny pod adresem: <strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">https://www.presora.app</a></strong></li>
      </ul>
    </td>
  </tr>

  <!-- JĘZYK KOMUNIKACJI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.5 12.5L8 14.5L7 18L8 21" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M17 20.5L16.5 18L14 17V13.5L17 12.5L21.5 13" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M19 5.5L18.5 7L15 7.5V10.5L17.5 9.5H19.5L21.5 10.5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.5 10.5L5 8.5L7.5 8L9.5 5L8.5 3" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">JĘZYK KOMUNIKACJI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Możesz skontaktować się z nami w następujących językach:</p>
      <ul>
        <li>polski,</li>
        <li>angielski,</li>
        <li>francuski,</li>
        <li>hiszpański,</li>
        <li>niemiecki,</li>
        <li>włoski.</li>
      </ul>
    </td>
  </tr>

  <!-- WARUNKI TECHNICZNE -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#6366F1" stroke-width="1.5"></path><path fill="#111827" d="M11 19L13 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M14 6L16 8L14 10" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M10 6L8 8L10 10" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">WARUNKI TECHNICZNE</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Dla prawidłowego korzystania ze Strony internetowej konieczne jest spełnienie następujących warunków technicznych:</p>
      <ul>
        <li>urządzenie z dostępem do Internetu,</li>
        <li>przeglądarka internetowa obsługująca JavaScript i pliki cookies,</li>
        <li>aktywne konto e-mail — jeśli korzystasz z funkcji wymagających podania adresu e-mail.</li>
      </ul>
      <p>Ewentualne dodatkowe wymogi techniczne dotyczące Usług rozszerzonych są wskazywane Użytkownikowi zgodnie z wymogami przepisów prawa.</p>
    </td>
  </tr>

  <!-- USŁUGI NA STRONIE INTERNETOWEJ -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#6366F1" stroke-width="1.5"></path><path fill="#111827" d="M11 19L13 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">USŁUGI NA STRONIE INTERNETOWEJ</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Na naszej Stronie internetowej świadczymy usługi cyfrowe, wskazane niżej w Regulaminie („Usługi" lub „Usługa").</p>
      <p>W ramach Strony internetowej wyróżniamy Usługi:</p>
      <p><strong>a) Podstawowe:</strong></p>
      <ul>
        <li>możliwość przeglądania naszej Strony internetowej,</li>
        <li>formularz kontaktowy pozwalający na wysłanie do nas wiadomości.</li>
      </ul>
      <p><strong>oraz</strong></p>
      <p><strong>b) Rozszerzone:</strong></p>
      <ul>
        <li>Sprzedaż subskrypcji oraz kredytów (zasady korzystania z tej usługi określone są w odrębnym dokumencie, dostępnym tutaj: <a href="https://www.presora.app/regulamin" target="_blank" rel="noopener noreferrer">https://www.presora.app/regulamin</a>),</li>
        <li>usługa umożliwiająca wprowadzenie przez Ciebie własnych treści w ramach Strony internetowej (zasady korzystania z tej usługi opisane są niżej, w załączniku do tego Regulaminu).</li>
      </ul>
      <p><strong>USŁUGI PODSTAWOWE</strong></p>
      <p>Korzystanie z Usług podstawowych na Stronie internetowej jest bezpłatne, całkowicie dobrowolne i zależne od Twojej woli. W celu skorzystania z Usługi podstawowej należy skorzystać z odpowiednich funkcji Strony internetowej.</p>
      <p>Rozpoczynamy świadczenie Usługi podstawowej w momencie rozpoczęcia korzystania przez Ciebie z tej Usługi.</p>
      <p>Możesz bez ponoszenia jakichkolwiek kosztów w każdym czasie zrezygnować ze świadczenia Usługi podstawowej, poprzez zakończenie korzystania z tej Usługi.</p>
    </td>
  </tr>

  <!-- ROZPATRYWANIE REKLAMACJI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20.5 20.5L22 22" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">ROZPATRYWANIE REKLAMACJI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Prosimy o składanie ewentualnych reklamacji dotyczących Strony internetowej i Usług za pośrednictwem Punktu Kontaktowego, którego dane wskazane są na początku Regulaminu.</p>
      <p>Rozpatrujemy reklamacje w ciągu 14 dni od ich otrzymania.</p>
      <p>Szczegółowe procedury reklamacyjne w odniesieniu do Usług rozszerzonych określone zostały odrębnie, w ramach zasad dotyczących danej Usługi.</p>
    </td>
  </tr>

  <!-- PRYWATNOŚĆ I DANE OSOBOWE -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H13" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M8 10H16M8 6H12M8 14H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M19.9923 15.125L22.5477 15.774C22.8137 15.8416 23.0013 16.0833 22.9931 16.3576C22.8214 22.1159 19.5 23 19.5 23C19.5 23 16.1786 22.1159 16.0069 16.3576C15.9987 16.0833 16.1863 15.8416 16.4523 15.774L19.0077 15.125C19.3308 15.043 19.6692 15.043 19.9923 15.125Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">PRYWATNOŚĆ I DANE OSOBOWE</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Zasady przetwarzania danych osobowych i wykorzystywania plików cookies wskazane są w polityce prywatności dostępnej pod adresem: <strong><a href="https://www.presora.app/polityka-prywatnosci" target="_blank" rel="noopener noreferrer">https://www.presora.app/polityka-prywatnosci</a></strong></p>
    </td>
  </tr>

  <!-- POZOSTAŁE POSTANOWIENIA -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M8 10H16M8 6H12M8 14H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M20.5 20.5L22 22" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">POZOSTAŁE POSTANOWIENIA DOTYCZĄCE USŁUG</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Każdorazowe skorzystanie przez Ciebie z Usługi uregulowanej w niniejszym dokumencie stanowi odrębną umowę, a jej aktualna treść — w postaci niniejszego Regulaminu — jest dostępna na Stronie internetowej.</p>
      <p>Zakazane jest dostarczanie przez Ciebie w ramach Usług treści o charakterze bezprawnym.</p>
      <p>Umowa zawierana jest w języku polskim, na czas i w celu świadczenia Usługi. Umowa podlega przepisom prawa polskiego, z zastrzeżeniem kolejnego zdania.</p>
      <p>Wybór prawa polskiego dla umowy zawartej na podstawie Regulaminu z Konsumentem nie uchyla i nie ogranicza Twoich konsumenckich praw przysługujących Ci na podstawie bezwzględnie obowiązujących przepisów prawa, znajdujących zastosowanie dla Ciebie w sytuacji, w której nie ma miejsca wybór prawa. Oznacza to w szczególności, że jeśli właściwe dla Ciebie przepisy krajowe przewidują szerszą ochronę konsumencką niż wynikająca z niniejszego Regulaminu lub prawa polskiego — stosuje się tę ochronę szerszą.</p>
      <p>W przypadku ewentualnego sporu związanego z umową, jeśli nie jesteś Usługobiorcą uprzywilejowanym, sądem właściwym będzie sąd właściwy dla naszej siedziby.</p>
      <p>Wszelka nasza odpowiedzialność w związku z umową zawartą w oparciu o Regulamin w stosunku do Ciebie — jeśli nie jesteś Usługobiorcą uprzywilejowanym — w granicach prawem dopuszczonych, jest wyłączona.</p>
    </td>
  </tr>

  <!-- ZAŁĄCZNIK - nagłówek -->
  <tr style="border:1px solid #334155;">
    <td colspan="2" style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">Załącznik do Regulaminu — Zasady dotyczące treści Użytkowników zamieszczanych w ramach Strony internetowej</td>
  </tr>

  <!-- TREŚCI WPROWADZANE PRZEZ UŻYTKOWNIKÓW -->
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#111827;color:#6366F1;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p><strong>TREŚCI WPROWADZANE PRZEZ UŻYTKOWNIKÓW</strong></p>
      <p>Umożliwiamy Ci wprowadzenie za pośrednictwem naszej Strony internetowej treści przeznaczonych do wyświetlenia na Stronie internetowej.</p>
      <p>Realizacja usługi przez nas następuje w momencie skorzystania z niej przez Ciebie. Możesz w każdym czasie zrezygnować z wprowadzenia treści, poprzez zakończenie korzystania z tej funkcji.</p>
    </td>
  </tr>

  <!-- OGRANICZENIA DOTYCZĄCE TREŚCI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M19.1414 5C17.3265 3.14864 14.7974 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19M19.1414 5C20.9097 6.80375 22 9.27455 22 12C22 17.5228 17.5228 22 12 22C9.20261 22 6.67349 20.8514 4.85857 19M19.1414 5L4.85857 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">OGRANICZENIA DOTYCZĄCE TREŚCI WPROWADZANYCH PRZEZ UŻYTKOWNIKÓW</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Pamiętaj, że korzystając z naszej Strony internetowej nie możesz wprowadzać nielegalnych treści (w szczególności treści takich jak nawoływanie do nienawiści, treści o charakterze terrorystycznym i niezgodne z prawem treści dyskryminujące), albo treści, które stają się nielegalne na mocy obowiązujących przepisów ze względu na fakt, iż odnoszą się one do nielegalnych działań. Przykładowo, za nielegalne treści uznawane są działania takie jak:</p>
      <ul>
        <li>udostępnianie obrazów przedstawiających niegodziwe traktowanie dzieci w celach seksualnych,</li>
        <li>bezprawne udostępnianie prywatnych obrazów bez zgody,</li>
        <li>cyberstalking,</li>
        <li>nieuprawnione wykorzystanie materiałów chronionych prawem autorskim,</li>
        <li>nielegalne oferowanie usług zakwaterowania,</li>
        <li>nielegalna sprzedaż żywych zwierząt.</li>
      </ul>
      <p>Nie powinieneś też wprowadzać treści naruszających zasady współżycia społecznego lub niezgodnych z warunkami korzystania z naszych Usług. W szczególności w ramach korzystania z naszej strony zabronione jest wprowadzanie treści mogących stanowić:</p>
      <ul>
        <li><strong>Upokarzające, obrażające lub poniżające materiały:</strong> wszelkie treści mogące być uznane za obraźliwe lub poniżające, a także mogące naruszać czyjekolwiek dobre imię.</li>
        <li><strong>Treści erotyczne:</strong> materiały o charakterze pornograficznym lub inne treści o wyraźnym podłożu seksualnym.</li>
        <li><strong>Nieprawdziwe informacje i dezinformacja:</strong> rozpowszechnianie fałszywych informacji lub treści wprowadzających użytkowników w błąd.</li>
        <li><strong>Propaganda i ideologie totalitarne:</strong> materiały promujące ideologie lub działania uznane w Polsce za nielegalne.</li>
        <li><strong>Spam i niezamówione informacje reklamowe:</strong> wysyłanie lub publikowanie niezamówionych materiałów reklamowych lub marketingowych.</li>
        <li><strong>Naruszenie praw własności intelektualnej:</strong> publikowanie treści bez odpowiednich praw lub licencji.</li>
        <li><strong>Podszywanie się pod innych użytkowników:</strong> udawanie kogoś innego lub publikowanie treści w imieniu innej osoby bez jej zgody.</li>
        <li><strong>Treści niezwiązane z działalnością Strony internetowej:</strong> publikowanie materiałów, które nie są związane z tematyką lub celem działania Strony internetowej.</li>
        <li><strong>Treści powszechnie uznane za nieprzyzwoite:</strong> w tym wulgaryzmy.</li>
      </ul>
    </td>
  </tr>

  <!-- ZGŁASZANIE NIELEGALNYCH TREŚCI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 8L12 12" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 16.01L12.01 15.9989" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">ZGŁASZANIE NIELEGALNYCH TREŚCI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Jeśli chcesz zgłosić nam nielegalne treści, skontaktuj się z nami za pośrednictwem adresu e-mail:</p>
      <p><strong>contact.presora@gmail.com</strong></p>
      <p>lub formularza kontaktowego dostępnego pod adresem:</p>
      <p><strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">https://www.presora.app</a></strong></p>
      <p><strong>Prosimy, abyś w zgłoszeniu zawarł/a:</strong></p>
      <ul>
        <li>Wystarczająco uzasadnione wyjaśnienie powodów, dla których zarzucasz, że odpowiednie informacje stanowią nielegalne treści.</li>
        <li>Jasne wskazanie dokładnej elektronicznej lokalizacji informacji (adres URL) oraz, w stosownych przypadkach, dodatkowe informacje umożliwiające identyfikację nielegalnych treści.</li>
        <li>Twoje imię i nazwisko oraz adres e-mail — z wyjątkiem zgłoszenia dotyczącego informacji uznawanych za związane z przestępstwami seksualnymi wobec dzieci.</li>
        <li>Oświadczenie potwierdzające powzięte w dobrej wierze przekonanie, że informacje i zarzuty w zgłoszeniu są prawidłowe i kompletne.</li>
      </ul>
      <p>Zbieramy te informacje ze względu na art. 16 ust. 2 Rozporządzenia DSA (Akt o usługach cyfrowych, UE 2022/2065).</p>
      <p>W przypadku wysłania zgłoszenia — potwierdzimy jego otrzymanie i poinformujemy o podjętych działaniach.</p>
    </td>
  </tr>

  <!-- WZÓR ZGŁOSZENIA -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M21.4383 11.6622L12.2483 20.8522C11.1225 21.9781 9.59552 22.6106 8.00334 22.6106C6.41115 22.6106 4.88418 21.9781 3.75834 20.8522C2.63249 19.7264 2 18.1994 2 16.6072C2 15.015 2.63249 13.4881 3.75834 12.3622L12.9483 3.17222C13.6989 2.42166 14.7169 2 15.7783 2C16.8398 2 17.8578 2.42166 18.6083 3.17222C19.3589 3.92279 19.7806 4.94077 19.7806 6.00222C19.7806 7.06368 19.3589 8.08166 18.6083 8.83222L9.40834 18.0222C9.03306 18.3975 8.52406 18.6083 7.99334 18.6083C7.46261 18.6083 6.95362 18.3975 6.57834 18.0222C6.20306 17.6469 5.99222 17.138 5.99222 16.6072C5.99222 16.0765 6.20306 15.5675 6.57834 15.1922L15.0683 6.71222" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">WZÓR ZGŁOSZENIA INFORMACJI NIELEGALNYCH</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>W celu usprawnienia procesu zgłaszania nielegalnych treści zachęcamy do przesyłania informacji zgodnie z poniższym wzorem. Skorzystanie z wzoru NIE JEST obowiązkowe.</p>
      <p><strong>Imię i nazwisko zgłaszającego:</strong> ……………………….</p>
      <p><strong>Adres e-mail zgłaszającego:</strong> ………………………</p>
      <p>(Pola na dane zgłaszającego nie odnoszą się do zgłoszeń dotyczących przestępstw seksualnych wobec dzieci — art. 3–7 dyrektywy 2011/93/UE)</p>
      <p><strong>Adres/y URL zgłaszanych treści:</strong><br>……………………………………………………………………………………………………………</p>
      <p><strong>Ewentualne dodatkowe informacje pozwalające na identyfikację treści:</strong><br>……………………………………………………………</p>
      <p><strong>Uzasadnione wyjaśnienie powodów, dla których zarzucam, że zgłaszane informacje stanowią nielegalne treści:</strong></p>
      <p>………………………………………………………………………………………………………………………</p>
      <p>………………………………………………………………………………………………………………………</p>
      <p><strong>Oświadczam, że w dobrej wierze powziąłem/powzięłam przekonanie, że informacje i zarzuty w moim zgłoszeniu są prawidłowe i kompletne.</strong></p>
    </td>
  </tr>

  <!-- MODEROWANIE TREŚCI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M21 21L9 21" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15.889 14.8891L8.46436 7.46448" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.8934 12.6066L12.0858 3.41421C12.8668 2.63317 14.1332 2.63317 14.9142 3.41421L19.864 8.36396C20.645 9.14501 20.645 10.4113 19.864 11.1924L10.6213 20.435C10.2596 20.7968 9.76894 21 9.25736 21C8.74577 21 8.25514 20.7968 7.8934 20.435L2.8934 15.435C2.11235 14.654 2.11235 13.3877 2.8934 12.6066Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">MODEROWANIE TREŚCI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Treści wprowadzane przez użytkowników są przez nas moderowane w odpowiedzi na zgłoszenia użytkowników.</p>
      <p>Reagujemy na wszelkie zgłoszenia dotyczące możliwego naruszenia prawa lub zasad współżycia społecznego. Bezzwłocznie podejmujemy odpowiednie działania w celu usunięcia lub uniemożliwienia dostępu do nielegalnych treści — gdy tylko uzyskamy taką wiedzę lub wiadomość.</p>
      <p>Możemy też z własnej inicjatywy moderować treści wprowadzane przez użytkowników. Pamiętaj, że nie jesteśmy zobligowani do samodzielnego wyszukiwania nielegalnych treści.</p>
      <p>Stosujemy jednak z własnej inicjatywy, w dobrej wierze i z należytą starannością, automatyczne mechanizmy moderowania treści:</p>
      <p><strong>Automatyczna moderacja treści</strong></p>
      <p>Serwis stosuje automatyczny system moderowania treści, który analizuje dane wprowadzane przez Użytkownika — w szczególności nazwy marek oraz treści dodawane do Bazy Wiedzy o marce. System działa w czasie rzeczywistym i może odrzucić treści zawierające:</p>
      <ul>
        <li>mowę nienawiści lub dyskryminację ze względu na rasę, płeć, orientację seksualną, wyznanie lub inne cechy chronione,</li>
        <li>groźby, przemoc lub treści nawołujące do samookaleczenia,</li>
        <li>treści o charakterze seksualnym, w szczególności z udziałem osób nieletnich,</li>
        <li>treści stanowiące spam, oszustwo lub próbę manipulacji systemem,</li>
        <li>inne treści naruszające niniejszy Regulamin lub powszechnie obowiązujące przepisy prawa.</li>
      </ul>
      <p>Odrzucenie treści przez system moderacji skutkuje brakiem możliwości wykonania analizy lub zapisania fragmentu wiedzy. Użytkownik zostaje o tym poinformowany stosownym komunikatem w interfejsie serwisu. Serwis nie przechowuje treści odrzuconych przez system moderacji.</p>
      <p>Automatyczna moderacja nie zastępuje odpowiedzialności Użytkownika za wprowadzane treści. Użytkownik ponosi pełną odpowiedzialność za zgodność publikowanych treści z prawem i niniejszym Regulaminem. Administrator zastrzega sobie prawo do ręcznego przeglądu i usunięcia treści naruszających zasady serwisu, także w przypadkach, gdy nie zostały one wykryte przez system automatyczny.</p>
      <p>Treści mogą być też przeglądane przez nas ręcznie, bez udziału narzędzi automatycznych.</p>
      <p>Moderowanie treści ma miejsce w oparciu o przepisy prawa, w szczególności przepisy aktu o usługach cyfrowych (DSA).</p>
    </td>
  </tr>

  <!-- UZASADNIENIE DZIAŁAŃ -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 7V9" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 13.01L12.01 12.9989" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M3 20.2895V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7.96125C7.35368 17 6.77906 17.2762 6.39951 17.7506L4.06852 20.6643C3.71421 21.1072 3 20.8567 3 20.2895Z" stroke="#6366F1" stroke-width="1.5"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">UZASADNIENIE DZIAŁAŃ, KTÓRE PODEJMUJEMY WOBEC TREŚCI OD UŻYTKOWNIKÓW</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>W przypadku podjęcia działań wobec treści nielegalnych lub niezgodnych z opisanymi w tym dokumencie zasadami, informujemy wszystkich zainteresowanych odbiorców — o ile znamy ich odpowiednie elektroniczne dane kontaktowe — o nałożonych ograniczeniach, w postaci:</p>
      <ul>
        <li>Ograniczenia w zakresie widoczności określonych informacji, w tym usuwanie treści, uniemożliwianie dostępu do treści lub depozycjonowanie treści.</li>
        <li>Zawieszenie, zakończenie lub inne ograniczenie płatności pieniężnych.</li>
        <li>Zawieszenie lub zakończenie świadczenia usługi w całości lub w części.</li>
        <li>Zawieszenie lub zamknięcie konta odbiorcy usługi.</li>
      </ul>
      <p>Każde podjęte przez nas działanie zostanie uzasadnione.</p>
      <p>Możemy odstąpić od takiej informacji, jeżeli treści są wprowadzającymi w błąd treściami handlowymi o dużej objętości.</p>
    </td>
  </tr>

  <!-- REKLAMACJE I SKARGI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M7 8L12 11L17 8" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M10 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V12.8571" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M13 17.1111H19.3C22.9 17.1111 22.9 22 19.3 22M13 17.1111L16.15 14M13 17.1111L16.15 20.2222" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">REKLAMACJE I SKARGI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Prosimy o składanie ewentualnych reklamacji i skarg dotyczących treści wprowadzonych przez Użytkowników lub usługi umożliwiającej ich wprowadzenie na adres pocztowy lub elektroniczny wskazany w Regulaminie.</p>
      <p>Ustosunkujemy się do reklamacji w terminie 14 dni od otrzymania zgłoszenia reklamacyjnego.</p>
    </td>
  </tr>

  <!-- USŁUGOBIORCY UPRZYWILEJOWANI -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">USŁUGOBIORCY UPRZYWILEJOWANI</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Postanowienia tej sekcji dotyczą tylko Usługobiorców uprzywilejowanych.</p>
      <p>Jeśli jesteś Usługobiorcą uprzywilejowanym, to w przypadku zawarcia z Tobą umowy na świadczenie usługi wprowadzenia treści na Stronie internetowej („Umowa"), ponosimy wobec Ciebie odpowiedzialność za zgodność świadczenia z Umową, przewidzianą przez powszechnie obowiązujące przepisy prawa, w tym zwłaszcza przez przepisy polskiej ustawy z dnia 30 maja 2014 r. o prawach konsumenta.</p>
      <p>Jeżeli nie dostarczyliśmy usługi cyfrowej, możesz wezwać nas do jej dostarczenia. Jeżeli mimo to nie dostarczymy usługi cyfrowej niezwłocznie lub w dodatkowym, wyraźnie uzgodnionym terminie, możesz odstąpić od Umowy.</p>
      <p>Możesz odstąpić od Umowy bez wzywania do dostarczenia usługi cyfrowej, jeżeli:</p>
      <ul>
        <li>z naszego oświadczenia lub okoliczności wyraźnie wynika, że nie dostarczymy usługi cyfrowej, lub</li>
        <li>uzgodniliśmy z Tobą lub z okoliczności zawarcia Umowy wyraźnie wynika, że określony termin dostarczenia miał dla Ciebie istotne znaczenie, a my nie dostarczyliśmy jej w tym terminie.</li>
      </ul>
      <p>Jeśli usługa cyfrowa jest niezgodna z Umową, możesz żądać jej doprowadzenia do zgodności z tą Umową.</p>
      <p>Dodatkowo, jeżeli usługa cyfrowa jest niezgodna z Umową, możesz złożyć oświadczenie o odstąpieniu od tej Umowy, gdy:</p>
      <ul>
        <li>doprowadzenie do zgodności jest niemożliwe albo wymaga nadmiernych kosztów,</li>
        <li>nie doprowadziliśmy usługi do zgodności w rozsądnym czasie i bez nadmiernych niedogodności,</li>
        <li>brak zgodności usługi z Umową występuje nadal, mimo że próbowaliśmy go usunąć,</li>
        <li>brak zgodności jest na tyle istotny, że uzasadnia odstąpienie od Umowy bez uprzedniego żądania doprowadzenia do zgodności,</li>
        <li>z naszego oświadczenia lub okoliczności wyraźnie wynika, że nie doprowadzimy usługi do zgodności w rozsądnym czasie.</li>
      </ul>
      <p><strong>Pozasądowe sposoby rozpatrywania reklamacji i dochodzenia roszczeń</strong></p>
      <p>Jako Konsument możesz skorzystać m.in. z pomocy odpowiedniego Europejskiego Centrum Konsumenckiego. Lista Centrów: <a href="https://konsument.gov.pl/eck-w-europie/" target="_blank" rel="noopener noreferrer">https://konsument.gov.pl/eck-w-europie/</a></p>
      <p>Ponadto, na terenie Rzeczypospolitej Polskiej można skorzystać z:</p>
      <ul>
        <li>mediacji prowadzonej przez właściwy terenowo Wojewódzki Inspektorat Inspekcji Handlowej (<a href="https://uokik.gov.pl/kontakt-inspekcja-handlowa" target="_blank" rel="noopener noreferrer">wykaz inspektoratów</a>),</li>
        <li>pomocy stałego polubownego sądu konsumenckiego działającego przy Wojewódzkim Inspektoracie Inspekcji Handlowej.</li>
      </ul>
      <p>Skorzystanie z pozasądowych sposobów rozpatrywania reklamacji jest dobrowolne zarówno dla nas, jak i Konsumenta. Jako Konsument możesz dodatkowo skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów.</p>
      <p><strong>Prawo odstąpienia od umowy</strong></p>
      <p>Jeśli jesteś Usługobiorcą uprzywilejowanym, masz prawo odstąpić od zawartej z nami Umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny.</p>
      <p>Termin do odstąpienia od Umowy wygasa po upływie 14 dni od dnia zawarcia tej Umowy.</p>
      <p>Aby skorzystać z prawa odstąpienia od Umowy, musisz poinformować nas o swojej decyzji w drodze jednoznacznego oświadczenia (pismo wysłane pocztą lub pocztą elektroniczną). Możesz skorzystać z wzoru formularza poniżej — nie jest to obowiązkowe.</p>
      <p><strong>WZÓR FORMULARZA ODSTĄPIENIA OD UMOWY</strong></p>
      <p>(Formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)</p>
      <p>Adresat:<br>Patryk Rybacki, działalność nierejestrowana<br>Biskupia 7/2<br>adres e-mail: contact.presora@gmail.com</p>
      <p>Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym(*) odstąpieniu od umowy o świadczenie następującej usługi (*):</p>
      <p>………………………………………………………………………………………</p>
      <p>Data zawarcia umowy(*): ………………………………………</p>
      <p>Imię i nazwisko konsumenta(-ów): ………………………………………………</p>
      <p>Adres konsumenta(-ów): ………………………………………………………………</p>
      <p>Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w wersji papierowej): ………………………………………………</p>
      <p>Data: ………………………………………………</p>
      <p>(*) Niepotrzebne skreślić.</p>
    </td>
  </tr>

  <!-- STOPKA -->
  <tr style="border:1px solid #334155;">
    <th colspan="2" style="border:1px solid #334155;padding:8px;background-color:#1E293B;color:#F8FAFC;text-align:center;">
      <small>
        Regulamin strony internetowej z dnia 18.06.2026.<br>
        Numer licencji nadanej przez Kreator Legal Geek: <a href="https://kreator.legalgeek.pl/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">f6f61186-8cc8-4ba2-b721-8d31432e3f71</a>.
      </small>
    </th>
  </tr>

</table>
`;

const EN_HTML = `
${STYLE_BLOCK}
<div style="max-width:85%;margin:0 auto 1.5em;padding:0.75em 1em;border:1px solid #f59e0b40;background:#f59e0b14;border-radius:8px;font-family:sans-serif;font-size:13px;color:#F8FAFC;text-align:center;">
  ⚠️ Unofficial machine-assisted translation, provided for convenience only. The
  <strong>Polish version is the sole legally binding text</strong> of these Terms of Service; in case
  of any discrepancy, the Polish version prevails.
</div>
<table class="legal-doc" style="width:85%;border-collapse:collapse;margin-left:auto;margin-right:auto;font-family:sans-serif;font-size:12pt;">

  <!-- HEADER -->
  <tr style="border:1px solid #334155;">
    <th colspan="2" style="border:1px solid #334155;padding:8px;padding-top:20px;font-size:18px;line-height:40px;background-color:#1E293B;color:#F8FAFC;text-align:center;">
      Terms of Service<br>
      Presora PL ("Terms")<br>
      <small style="font-size:14px;font-weight:normal;">Document dated: 18.06.2026</small>
    </th>
  </tr>

  <!-- DEFINITIONS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 21V7C12 5.89543 12.8954 5 14 5H21.4C21.7314 5 22 5.26863 22 5.6V18.7143" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M12 21V7C12 5.89543 11.1046 5 10 5H2.6C2.26863 5 2 5.26863 2 5.6V18.7143" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M14 19L22 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M10 19L2 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M12 21C12 19.8954 12.8954 19 14 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 21C12 19.8954 11.1046 19 10 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">DEFINITIONS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p><strong>Website</strong></p>
      <p>The <strong>Presora PL</strong> website, available at <strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">www.presora.app</a></strong>, operated by the Service Provider.</p>
      <p><strong>Service Provider</strong></p>
      <p>Patryk Rybacki<br>unregistered (sole trader) business activity<br>Biskupia 7/2</p>
      <p>Where these Terms use words such as "we", "our", "us", etc., this refers to the Service Provider.</p>
      <p><strong>Service Recipient</strong></p>
      <p>Any entity using the Website, including the services available on it.</p>
      <p><strong>Consumer</strong></p>
      <p>A Service Recipient who is a natural person using the Website without a direct connection to their business or professional activity.</p>
      <p><strong>Privileged Entrepreneur</strong></p>
      <p>A Service Recipient who is a natural person concluding a contract under these Terms (or taking steps aimed at concluding one) directly related to their business activity, but which does not have a professional character for them.</p>
      <p><strong>Privileged Service Recipient</strong></p>
      <p>A Service Recipient who is a Consumer or a Privileged Entrepreneur.</p>
    </td>
  </tr>

  <!-- CONTACT POINT -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M7 9L12 12.5L17 9" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" stroke="#6366F1" stroke-width="1.5"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">CONTACT POINT</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>To contact us, you can use the following forms of electronic communication:</p>
      <ul>
        <li>e-mail: <strong>contact.presora@gmail.com</strong></li>
        <li>the contact form available at: <strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">https://www.presora.app</a></strong></li>
      </ul>
    </td>
  </tr>

  <!-- LANGUAGE OF COMMUNICATION -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.5 12.5L8 14.5L7 18L8 21" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M17 20.5L16.5 18L14 17V13.5L17 12.5L21.5 13" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M19 5.5L18.5 7L15 7.5V10.5L17.5 9.5H19.5L21.5 10.5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.5 10.5L5 8.5L7.5 8L9.5 5L8.5 3" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">LANGUAGE OF COMMUNICATION</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>You can contact us in the following languages:</p>
      <ul>
        <li>Polish,</li>
        <li>English,</li>
        <li>French,</li>
        <li>Spanish,</li>
        <li>German,</li>
        <li>Italian.</li>
      </ul>
    </td>
  </tr>

  <!-- TECHNICAL REQUIREMENTS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#6366F1" stroke-width="1.5"></path><path fill="#111827" d="M11 19L13 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M14 6L16 8L14 10" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M10 6L8 8L10 10" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">TECHNICAL REQUIREMENTS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Proper use of the Website requires meeting the following technical requirements:</p>
      <ul>
        <li>a device with internet access,</li>
        <li>a web browser supporting JavaScript and cookies,</li>
        <li>an active e-mail account — if you use functions requiring an e-mail address.</li>
      </ul>
      <p>Any additional technical requirements for the Extended Services are indicated to the User in accordance with the requirements of applicable law.</p>
    </td>
  </tr>

  <!-- SERVICES ON THE WEBSITE -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#6366F1" stroke-width="1.5"></path><path fill="#111827" d="M11 19L13 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">SERVICES ON THE WEBSITE</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>On our Website, we provide digital services, indicated below in these Terms ("Services" or "Service").</p>
      <p>Within the Website, we distinguish the following Services:</p>
      <p><strong>a) Basic:</strong></p>
      <ul>
        <li>the ability to browse our Website,</li>
        <li>a contact form allowing you to send us a message.</li>
      </ul>
      <p><strong>and</strong></p>
      <p><strong>b) Extended:</strong></p>
      <ul>
        <li>Sale of subscriptions and credits (the rules for using this service are set out in a separate document, available here: <a href="https://www.presora.app/regulamin" target="_blank" rel="noopener noreferrer">https://www.presora.app/regulamin</a>),</li>
        <li>a service allowing you to introduce your own content within the Website (the rules for using this service are described below, in the annex to these Terms).</li>
      </ul>
      <p><strong>BASIC SERVICES</strong></p>
      <p>Using the Basic Services on the Website is free, entirely voluntary, and dependent on your will. To use a Basic Service, you need to use the relevant functions of the Website.</p>
      <p>We begin providing the Basic Service at the moment you start using it.</p>
      <p>You may, without incurring any costs, resign from the Basic Service at any time by ceasing to use it.</p>
    </td>
  </tr>

  <!-- HANDLING COMPLAINTS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20.5 20.5L22 22" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">HANDLING COMPLAINTS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Please submit any complaints regarding the Website and Services via the Contact Point, whose details are indicated at the beginning of these Terms.</p>
      <p>We handle complaints within 14 days of receiving them.</p>
      <p>Detailed complaint procedures for the Extended Services are set out separately, within the rules governing the given Service.</p>
    </td>
  </tr>

  <!-- PRIVACY AND PERSONAL DATA -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H13" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M8 10H16M8 6H12M8 14H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M19.9923 15.125L22.5477 15.774C22.8137 15.8416 23.0013 16.0833 22.9931 16.3576C22.8214 22.1159 19.5 23 19.5 23C19.5 23 16.1786 22.1159 16.0069 16.3576C15.9987 16.0833 16.1863 15.8416 16.4523 15.774L19.0077 15.125C19.3308 15.043 19.6692 15.043 19.9923 15.125Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">PRIVACY AND PERSONAL DATA</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>The rules for processing personal data and using cookies are set out in the Privacy Policy available at: <strong><a href="https://www.presora.app/polityka-prywatnosci" target="_blank" rel="noopener noreferrer">https://www.presora.app/polityka-prywatnosci</a></strong></p>
    </td>
  </tr>

  <!-- OTHER PROVISIONS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M8 10H16M8 6H12M8 14H11" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M20.5 20.5L22 22" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">OTHER PROVISIONS CONCERNING THE SERVICES</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Each time you use a Service governed by this document constitutes a separate contract, and its current wording — in the form of these Terms — is available on the Website.</p>
      <p>You are prohibited from providing unlawful content within the Services.</p>
      <p>The contract is concluded in Polish, for the duration and purpose of providing the Service. The contract is governed by Polish law, subject to the next sentence.</p>
      <p>The choice of Polish law for a contract concluded with a Consumer under these Terms does not deprive you of, or limit, the consumer rights you are entitled to under mandatory legal provisions that would apply to you had there been no choice of law. In particular, this means that if the national provisions applicable to you provide broader consumer protection than that resulting from these Terms or Polish law, that broader protection applies.</p>
      <p>In the event of a dispute related to the contract, if you are not a Privileged Service Recipient, the court having jurisdiction will be the court competent for our registered seat.</p>
      <p>All our liability in connection with a contract concluded under these Terms towards you — if you are not a Privileged Service Recipient — is excluded to the extent permitted by law.</p>
    </td>
  </tr>

  <!-- ANNEX HEADER -->
  <tr style="border:1px solid #334155;">
    <td colspan="2" style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">Annex to the Terms — Rules Concerning User Content Posted Within the Website</td>
  </tr>

  <!-- CONTENT SUBMITTED BY USERS -->
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#111827;color:#6366F1;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p><strong>CONTENT SUBMITTED BY USERS</strong></p>
      <p>We allow you to submit, via our Website, content intended to be displayed on the Website.</p>
      <p>We perform this service at the moment you use it. You can withdraw from submitting content at any time by ceasing to use this function.</p>
    </td>
  </tr>

  <!-- RESTRICTIONS ON CONTENT -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M19.1414 5C17.3265 3.14864 14.7974 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19M19.1414 5C20.9097 6.80375 22 9.27455 22 12C22 17.5228 17.5228 22 12 22C9.20261 22 6.67349 20.8514 4.85857 19M19.1414 5L4.85857 19" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">RESTRICTIONS ON CONTENT SUBMITTED BY USERS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Please remember that when using our Website, you may not submit illegal content (in particular content such as incitement to hatred, terrorist content, and unlawful discriminatory content), or content that becomes illegal under applicable law because it relates to illegal activities. For example, the following are considered illegal content:</p>
      <ul>
        <li>sharing images depicting child sexual abuse,</li>
        <li>unlawfully sharing private images without consent,</li>
        <li>cyberstalking,</li>
        <li>unauthorized use of copyrighted material,</li>
        <li>illegal offering of accommodation services,</li>
        <li>illegal sale of live animals.</li>
      </ul>
      <p>You should also not submit content that violates principles of social conduct or is inconsistent with the terms of use of our Services. In particular, when using our website it is forbidden to submit content that may constitute:</p>
      <ul>
        <li><strong>Humiliating, offensive, or degrading material:</strong> any content that could be considered offensive or degrading, or that could harm anyone's good name.</li>
        <li><strong>Erotic content:</strong> pornographic material or other content of an overtly sexual nature.</li>
        <li><strong>False information and disinformation:</strong> spreading false information or content that misleads users.</li>
        <li><strong>Propaganda and totalitarian ideologies:</strong> material promoting ideologies or activities deemed illegal in Poland.</li>
        <li><strong>Spam and unsolicited advertising:</strong> sending or publishing unsolicited advertising or marketing materials.</li>
        <li><strong>Intellectual property infringement:</strong> publishing content without appropriate rights or licenses.</li>
        <li><strong>Impersonation of other users:</strong> pretending to be someone else, or publishing content on behalf of another person without their consent.</li>
        <li><strong>Content unrelated to the Website's activity:</strong> publishing materials unrelated to the subject matter or purpose of the Website.</li>
        <li><strong>Content generally considered indecent:</strong> including vulgar language.</li>
      </ul>
    </td>
  </tr>

  <!-- REPORTING ILLEGAL CONTENT -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 8L12 12" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 16.01L12.01 15.9989" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">REPORTING ILLEGAL CONTENT</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>If you would like to report illegal content to us, please contact us via e-mail:</p>
      <p><strong>contact.presora@gmail.com</strong></p>
      <p>or the contact form available at:</p>
      <p><strong><a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">https://www.presora.app</a></strong></p>
      <p><strong>Please include in your report:</strong></p>
      <ul>
        <li>A sufficiently substantiated explanation of the reasons why you allege the relevant information constitutes illegal content.</li>
        <li>A clear indication of the exact electronic location of the information (URL) and, where appropriate, additional information enabling identification of the illegal content.</li>
        <li>Your name and e-mail address — except for reports concerning information considered related to sexual offenses against children.</li>
        <li>A statement confirming a good-faith belief that the information and allegations in the report are accurate and complete.</li>
      </ul>
      <p>We collect this information pursuant to Art. 16(2) of the DSA Regulation (Digital Services Act, EU 2022/2065).</p>
      <p>If you send a report, we will confirm its receipt and inform you of the actions taken.</p>
    </td>
  </tr>

  <!-- REPORT TEMPLATE -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M21.4383 11.6622L12.2483 20.8522C11.1225 21.9781 9.59552 22.6106 8.00334 22.6106C6.41115 22.6106 4.88418 21.9781 3.75834 20.8522C2.63249 19.7264 2 18.1994 2 16.6072C2 15.015 2.63249 13.4881 3.75834 12.3622L12.9483 3.17222C13.6989 2.42166 14.7169 2 15.7783 2C16.8398 2 17.8578 2.42166 18.6083 3.17222C19.3589 3.92279 19.7806 4.94077 19.7806 6.00222C19.7806 7.06368 19.3589 8.08166 18.6083 8.83222L9.40834 18.0222C9.03306 18.3975 8.52406 18.6083 7.99334 18.6083C7.46261 18.6083 6.95362 18.3975 6.57834 18.0222C6.20306 17.6469 5.99222 17.138 5.99222 16.6072C5.99222 16.0765 6.20306 15.5675 6.57834 15.1922L15.0683 6.71222" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">ILLEGAL CONTENT REPORT TEMPLATE</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>To streamline the process of reporting illegal content, we encourage you to submit information according to the template below. Using the template is NOT mandatory.</p>
      <p><strong>Reporting person's name:</strong> ……………………….</p>
      <p><strong>Reporting person's e-mail address:</strong> ………………………</p>
      <p>(Fields for the reporting person's details do not apply to reports concerning sexual offenses against children — Art. 3–7 of Directive 2011/93/EU)</p>
      <p><strong>URL(s) of the reported content:</strong><br>……………………………………………………………………………………………………………</p>
      <p><strong>Any additional information enabling identification of the content:</strong><br>……………………………………………………………</p>
      <p><strong>Substantiated explanation of the reasons why I allege the reported information constitutes illegal content:</strong></p>
      <p>………………………………………………………………………………………………………………………</p>
      <p>………………………………………………………………………………………………………………………</p>
      <p><strong>I declare that I have, in good faith, formed the belief that the information and allegations in my report are accurate and complete.</strong></p>
    </td>
  </tr>

  <!-- CONTENT MODERATION -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M21 21L9 21" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M15.889 14.8891L8.46436 7.46448" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M2.8934 12.6066L12.0858 3.41421C12.8668 2.63317 14.1332 2.63317 14.9142 3.41421L19.864 8.36396C20.645 9.14501 20.645 10.4113 19.864 11.1924L10.6213 20.435C10.2596 20.7968 9.76894 21 9.25736 21C8.74577 21 8.25514 20.7968 7.8934 20.435L2.8934 15.435C2.11235 14.654 2.11235 13.3877 2.8934 12.6066Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">CONTENT MODERATION</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Content submitted by users is moderated by us in response to user reports.</p>
      <p>We respond to any reports of possible violations of the law or principles of social conduct. We promptly take appropriate action to remove or disable access to illegal content as soon as we become aware of it.</p>
      <p>We may also moderate user-submitted content on our own initiative. Please note that we are not obliged to independently search for illegal content.</p>
      <p>However, on our own initiative, in good faith and with due diligence, we apply automatic content-moderation mechanisms:</p>
      <p><strong>Automatic content moderation</strong></p>
      <p>The Service uses an automatic content-moderation system that analyzes data entered by the User — in particular brand names and content added to the Brand Knowledge Base. The system operates in real time and may reject content containing:</p>
      <ul>
        <li>hate speech or discrimination based on race, gender, sexual orientation, religion, or other protected characteristics,</li>
        <li>threats, violence, or content inciting self-harm,</li>
        <li>content of a sexual nature, in particular involving minors,</li>
        <li>content constituting spam, fraud, or an attempt to manipulate the system,</li>
        <li>other content violating these Terms or generally applicable law.</li>
      </ul>
      <p>Rejection of content by the moderation system results in the inability to perform the analysis or save the piece of knowledge. The User is informed of this by an appropriate message in the service's interface. The Service does not store content rejected by the moderation system.</p>
      <p>Automatic moderation does not replace the User's responsibility for the content they submit. The User bears full responsibility for the compliance of published content with the law and these Terms. The Administrator reserves the right to manually review and remove content that violates the service's rules, including in cases where it was not detected by the automatic system.</p>
      <p>Content may also be reviewed by us manually, without the use of automated tools.</p>
      <p>Content moderation takes place based on legal provisions, in particular the provisions of the Digital Services Act (DSA).</p>
    </td>
  </tr>

  <!-- STATEMENT OF REASONS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M12 7V9" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M12 13.01L12.01 12.9989" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M3 20.2895V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7.96125C7.35368 17 6.77906 17.2762 6.39951 17.7506L4.06852 20.6643C3.71421 21.1072 3 20.8567 3 20.2895Z" stroke="#6366F1" stroke-width="1.5"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">STATEMENT OF REASONS FOR ACTIONS WE TAKE AGAINST USER CONTENT</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>When we take action against illegal content or content that does not comply with the rules described in this document, we inform all interested recipients — provided we know their relevant electronic contact details — of the restrictions imposed, in the form of:</p>
      <ul>
        <li>Restrictions on the visibility of specific information, including removing content, disabling access to content, or demoting content.</li>
        <li>Suspension, termination, or other restriction of monetary payments.</li>
        <li>Suspension or termination of the provision of the service in whole or in part.</li>
        <li>Suspension or closure of the service recipient's account.</li>
      </ul>
      <p>Every action we take will be justified.</p>
      <p>We may forgo providing such information if the content is high-volume, misleading commercial content.</p>
    </td>
  </tr>

  <!-- COMPLAINTS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#111827" color="#6366F1"><path fill="#111827" d="M7 8L12 11L17 8" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M10 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V12.8571" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M13 17.1111H19.3C22.9 17.1111 22.9 22 19.3 22M13 17.1111L16.15 14M13 17.1111L16.15 20.2222" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">COMPLAINTS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>Please submit any complaints regarding content submitted by Users, or the service enabling such submission, to the postal or electronic address indicated in these Terms.</p>
      <p>We will respond to complaints within 14 days of receiving the complaint.</p>
    </td>
  </tr>

  <!-- PRIVILEGED SERVICE RECIPIENTS -->
  <tr style="border:1px solid #334155;">
    ${ICON_ROWSPAN2('<svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#111827" color="#6366F1"><path fill="#111827" d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"></path><path fill="#111827" d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#111827" d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>')}
    <td style="border:1px solid #334155;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#6366F1;color:#F8FAFC;">PRIVILEGED SERVICE RECIPIENTS</td>
  </tr>
  <tr style="border:1px solid #334155;">
    <td style="border:1px solid #334155;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#111827;color:#F8FAFC;">
      <p>The provisions of this section apply only to Privileged Service Recipients.</p>
      <p>If you are a Privileged Service Recipient, in the event a contract is concluded with you for the provision of the content-submission service on the Website ("Agreement"), we are liable to you for the conformity of our performance with the Agreement, as provided by generally applicable law, in particular the Polish Act of 30 May 2014 on Consumer Rights.</p>
      <p>If we have not delivered the digital service, you may call on us to deliver it. If we still do not deliver the digital service promptly, or within an additional, explicitly agreed period, you may withdraw from the Agreement.</p>
      <p>You may withdraw from the Agreement without calling on us to deliver the digital service if:</p>
      <ul>
        <li>it is clear from our statement or the circumstances that we will not deliver the digital service, or</li>
        <li>we agreed with you, or it is clear from the circumstances of concluding the Agreement, that a specific delivery deadline was material to you, and we did not deliver it within that deadline.</li>
      </ul>
      <p>If the digital service is not in conformity with the Agreement, you may demand that it be brought into conformity with the Agreement.</p>
      <p>Additionally, if the digital service is not in conformity with the Agreement, you may submit a statement of withdrawal from the Agreement when:</p>
      <ul>
        <li>bringing it into conformity is impossible or requires disproportionate costs,</li>
        <li>we did not bring the service into conformity within a reasonable time and without significant inconvenience,</li>
        <li>the lack of conformity persists despite our attempts to remove it,</li>
        <li>the lack of conformity is significant enough to justify withdrawal from the Agreement without first demanding conformity,</li>
        <li>it is clear from our statement or the circumstances that we will not bring the service into conformity within a reasonable time.</li>
      </ul>
      <p><strong>Out-of-court methods of handling complaints and pursuing claims</strong></p>
      <p>As a Consumer, you may make use of, among others, the assistance of the relevant European Consumer Centre. List of Centres: <a href="https://konsument.gov.pl/eck-w-europie/" target="_blank" rel="noopener noreferrer">https://konsument.gov.pl/eck-w-europie/</a></p>
      <p>Furthermore, within the Republic of Poland, you may use:</p>
      <ul>
        <li>mediation conducted by the locally competent Provincial Inspectorate of Trade Inspection (<a href="https://uokik.gov.pl/kontakt-inspekcja-handlowa" target="_blank" rel="noopener noreferrer">list of inspectorates</a>),</li>
        <li>the assistance of the permanent amicable consumer court operating at the Provincial Inspectorate of Trade Inspection.</li>
      </ul>
      <p>Using out-of-court complaint-handling methods is voluntary both for us and for the Consumer. As a Consumer, you may additionally use the free assistance of the municipal or district consumer ombudsman.</p>
      <p><strong>Right of withdrawal from the contract</strong></p>
      <p>If you are a Privileged Service Recipient, you have the right to withdraw from the Agreement concluded with us within 14 days without giving any reason.</p>
      <p>The period for withdrawal from the Agreement expires after 14 days from the day the Agreement was concluded.</p>
      <p>To exercise the right of withdrawal, you must inform us of your decision by an unambiguous statement (a letter sent by post or e-mail). You may use the model form below — this is not mandatory.</p>
      <p><strong>MODEL WITHDRAWAL FORM</strong></p>
      <p>(This form should be completed and returned only if you wish to withdraw from the contract)</p>
      <p>Addressee:<br>Patryk Rybacki, unregistered (sole trader) business activity<br>Biskupia 7/2<br>e-mail address: contact.presora@gmail.com</p>
      <p>I/We(*) hereby give notice that I/we(*) withdraw from the contract for the provision of the following service(*):</p>
      <p>………………………………………………………………………………………</p>
      <p>Date the contract was concluded(*): ………………………………………</p>
      <p>Name(s) of the consumer(s): ………………………………………………</p>
      <p>Address of the consumer(s): ………………………………………………………………</p>
      <p>Signature of the consumer(s) (only if this form is submitted on paper): ………………………………………………</p>
      <p>Date: ………………………………………………</p>
      <p>(*) Delete as appropriate.</p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr style="border:1px solid #334155;">
    <th colspan="2" style="border:1px solid #334155;padding:8px;background-color:#1E293B;color:#F8FAFC;text-align:center;">
      <small>
        Terms of Service dated 18.06.2026.<br>
        License number issued by Kreator Legal Geek: <a href="https://kreator.legalgeek.pl/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">f6f61186-8cc8-4ba2-b721-8d31432e3f71</a>.
      </small>
    </th>
  </tr>

</table>
`;

const Terms = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'pl' | 'en'>('pl');

  useEffect(() => {
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = 'pl'; };
  }, [lang]);

  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'pl' ? 'Powrót' : 'Back'}
        </button>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1">
          <Languages className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-0.5" />
          <button
            type="button"
            onClick={() => setLang('pl')}
            aria-pressed={lang === 'pl'}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'pl' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            PL
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            EN
          </button>
        </div>
      </div>
      <div
        className="p-4 sm:p-8"
        style={{ background: '#111827', border: '1px solid #334155', borderRadius: 12 }}
        dangerouslySetInnerHTML={{ __html: lang === 'pl' ? PL_HTML : EN_HTML }}
      />
    </div>
    <Footer />
  </div>
  );
};

export default Terms;
