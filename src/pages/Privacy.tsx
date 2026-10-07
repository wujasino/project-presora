import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const STYLE_BLOCK = `<style>.legal-doc a { color: #6366F1; } .legal-doc a:hover { color: #4F46E5; } @media (max-width: 640px) { .legal-doc, .legal-doc table { display: block !important; width: 100% !important; max-width: 100% !important; } .legal-doc tr, .legal-doc thead, .legal-doc tbody { display: block !important; width: 100% !important; } .legal-doc td, .legal-doc th { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: left !important; } .legal-doc svg { width: 40px !important; height: 40px !important; } }</style>`;

const PL_HTML = `
${STYLE_BLOCK}
<div class="legal-doc" style="font-family: sans-serif; font-size: 13pt; line-height: 1.7; color: #F8FAFC;">

  <section style="margin-bottom: 2em; text-align: center;">
    <small>
      Polityka prywatności z dnia 18.06.2026.<br>
      Numer licencji nadanej przez Kreator Legal Geek: <a href="https://kreator.legalgeek.pl/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">f6f61186-8cc8-4ba2-b721-8d31432e3f71</a>.
    </small>
  </section>

  <h1 style="text-align:center; font-size:1.5em; margin-bottom:0.5em;">
    Polityka prywatności Serwisu Presora PL<br>
    <a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">www.presora.app</a><br>
    („Serwis")
  </h1>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">Drogi Użytkowniku!</h2>
    <p>Dbamy o Twoją prywatność i chcemy, abyś w czasie korzystania z naszych usług czuł się komfortowo. Dlatego też poniżej prezentujemy Ci najważniejsze informacje o zasadach przetwarzania przez nas Twoich danych osobowych oraz plikach cookies, które są wykorzystywane przez nasz Serwis. Informacje te zostały przygotowane z uwzględnieniem <strong>RODO</strong>, czyli Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (<strong>ogólnego rozporządzenia o ochronie danych</strong>).</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">ADMINISTRATOR DANYCH OSOBOWYCH</h2>
    <p>Patryk Rybacki<br>działalność nierejestrowana<br>Biskupia 7/2</p>
    <p>Jeśli chcesz skontaktować się z nami w związku z przetwarzaniem przez nas Twoich danych osobowych, napisz do nas na adres e-mail: <strong>contact.presora@gmail.com</strong>.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">TWOJE UPRAWNIENIA</h2>
    <p>Przysługuje Ci prawo żądania:</p>
    <ul>
      <li>dostępu do Twoich danych osobowych, w tym uzyskania kopii Twoich danych (art. 15 RODO lub — jeśli ma to zastosowanie — art. 13 ust. 1 lit. f RODO),</li>
      <li>ich sprostowania (art. 16 RODO),</li>
      <li>usunięcia (art. 17 RODO),</li>
      <li>ograniczenia przetwarzania (art. 18 RODO),</li>
      <li>przeniesienia danych do innego administratora (art. 20 RODO).</li>
    </ul>
    <p>A także prawo:</p>
    <ul>
      <li>wniesienia w dowolnym momencie sprzeciwu wobec przetwarzania Twoich danych:
        <ul>
          <li>z przyczyn związanych z Twoją szczególną sytuacją — wobec przetwarzania dotyczących Ciebie danych osobowych, opartego na art. 6 ust. 1 lit. f RODO (tj. na realizowanych przez nas prawnie uzasadnionych interesach) (art. 21 ust. 1 RODO);</li>
          <li>jeżeli dane osobowe są przetwarzane na potrzeby marketingu bezpośredniego, w zakresie, w jakim przetwarzanie jest związane z takim marketingiem bezpośrednim (art. 21 ust. 2 RODO).</li>
        </ul>
      </li>
    </ul>
    <p>Skontaktuj się z nami, jeśli chcesz skorzystać ze swoich praw. Sprzeciw w odniesieniu do wykorzystywania przez nas plików cookies możesz wyrazić zwłaszcza za pomocą odpowiednich ustawień przeglądarki.</p>
    <p>Jeśli uznasz, że Twoje dane są przetwarzane niezgodnie z prawem, możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">DANE OSOBOWE I PRYWATNOŚĆ</h2>
    <p>Poniżej znajdziesz szczegółowe informacje na temat przetwarzania Twoich danych w zależności od podejmowanych przez Ciebie działań.</p>

    <h3 style="font-size:1em; margin-top:1.2em;">1. Skorzystanie z bezpłatnych usług oferowanych w Serwisie</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">W jakim celu?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">realizacja umowy o świadczenie usług oferowanych w Serwisie</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Na jakiej podstawie?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">umowa o świadczenie usług (art. 6 ust. 1 lit. b RODO)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Jak długo?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">przez okres obowiązywania umowy</td></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ponadto, Twoje dane będą przetwarzane do upływu okresu, w którym możliwe jest dochodzenie roszczeń – przez Ciebie lub przez nas<br>(więcej informacji na ten temat znajdziesz w ostatniej tabeli tej sekcji)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie będziesz mieć możliwości skorzystania z naszych usług</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">2. Skorzystanie z płatnych usług oferowanych w Serwisie</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">W jakim celu?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">realizacja umowy o świadczenie usług oferowanych w Serwisie</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Na jakiej podstawie?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">umowa o świadczenie usług (art. 6 ust. 1 lit. b RODO)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">obowiązek prawny, w szczególności związany z rachunkowością, zobowiązujący nas do przetwarzania Twoich danych osobowych (art. 6 ust. 1 lit. c RODO)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Jak długo?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">przez okres obowiązywania umowy</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do momentu wygaśnięcia ciążących na nas obowiązków prawnych</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">ponadto, Twoje dane będą przetwarzane do upływu okresu, w którym możliwe jest dochodzenie roszczeń – przez Ciebie lub przez nas<br>(więcej informacji na ten temat znajdziesz w ostatniej tabeli tej sekcji)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">nie będziesz mieć możliwości skorzystania z naszych usług</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">3. Nawiązanie z nami kontaktu (np. w celu zadania pytania)</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">W jakim celu?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">obsługa Twoich zapytań lub zgłoszeń</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Na jakiej podstawie?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">umowa lub działania podejmowane na Twoje żądanie, zmierzające do jej zawarcia (art. 6 ust. 1 lit. b RODO) – w przypadku gdy Twoje zapytanie lub zgłoszenie dotyczy umowy, której jesteśmy lub możemy być stroną</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">nasz prawnie uzasadniony interes, polegający na przetwarzaniu Twoich danych w celu prowadzenia z Tobą komunikacji (art. 6 ust. 1 lit. f RODO) – jeżeli Twoje zapytanie lub zgłoszenie nie ma związku z umową</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Jak długo?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">przez czas trwania wiążącej nas umowy lub – jeśli umowa nie zostanie zawarta – do upływu okresu dochodzenia roszczeń – zobacz ostatnią tabelę tej sekcji*</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do upływu okresu dochodzenia roszczeń – zobacz ostatnią tabelę tej sekcji – lub do momentu, w którym uwzględnimy Twój sprzeciw wobec przetwarzania*</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">ponadto, Twoje dane będą przetwarzane do upływu okresu, w którym możliwe jest dochodzenie roszczeń – przez Ciebie lub przez nas<br>(więcej informacji na ten temat znajdziesz w ostatniej tabeli tej sekcji)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">nie będziemy mieli możliwości udzielenia odpowiedzi na Twoje zapytanie lub zgłoszenie</td></tr>
    </table>
    * w zależności od tego, które ma zastosowanie w danym przypadku<br><br>

    <h3 style="font-size:1em; margin-top:1.2em;">4. Ustawienia przeglądarki lub inne zbliżone działanie zezwalające na prowadzenie działań analitycznych</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">W jakim celu?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">analiza sposobu korzystania i poruszania się przez Ciebie po stronie internetowej Serwisu, celem polepszenia jej funkcjonalności<br>(więcej na ten temat przeczytasz w sekcji „Działania analityczne" i „Pliki cookies" Polityki prywatności)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Na jakiej podstawie?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nasz prawnie uzasadniony interes, polegający na przetwarzaniu danych w podanym wyżej celu (art. 6 ust. 1 lit. f RODO)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Jak długo?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">do momentu wygaśnięcia ważności lub usunięcia przez Ciebie plików cookies, wykorzystywanych do celów analitycznych*</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie uwzględnimy sposobu korzystania i poruszania się przez Ciebie po stronie internetowej Serwisu w pracach nad jej rozwojem</td></tr>
    </table>
    * w zależności od tego, które ma zastosowanie w danym przypadku<br><br>

    <h3 style="font-size:1em; margin-top:1.2em;">5. Wyrażenie przez Ciebie zgody na otrzymywanie od nas treści marketingowych</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">W jakim celu?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">wysyłka informacji marketingowych, zwłaszcza ofert specjalnych</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">analiza efektywności wysłanych przez nas wiadomości, celem ustalenia ogólnych zasad dotyczących skutecznej wysyłki wiadomości w naszej działalności<br>(więcej na ten temat przeczytasz w sekcji „Działania analityczne" Polityki prywatności)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Na jakiej podstawie?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">Twoja zgoda na nasze działania marketingowe (art. 6 ust. 1 lit. a RODO)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">nasz prawnie uzasadniony interes, polegający na przetwarzaniu danych w podanym wyżej celu (art. 6 ust. 1 lit. f RODO)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Jak długo?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do momentu wycofania przez Ciebie zgody – pamiętaj, w każdej chwili możesz wycofać zgodę. Przetwarzanie danych do momentu cofnięcia przez Ciebie zgody pozostaje zgodne z prawem.</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do momentu, w którym uwzględnimy Twój sprzeciw wobec przetwarzania</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">ponadto, Twoje dane będą przetwarzane do upływu okresu, w którym możliwe jest dochodzenie roszczeń – przez Ciebie lub przez nas<br>(więcej informacji na ten temat znajdziesz w ostatniej tabeli tej sekcji)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">nie będziesz otrzymywać naszych materiałów marketingowych, w tym informacji o naszych ofertach specjalnych</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">6. Zapisanie się na newsletter</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">W jakim celu?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">wysyłanie newslettera</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">analiza efektywności wysłanych przez nas treści, celem ustalenia ogólnych zasad dotyczących skutecznej wysyłki wiadomości w naszej działalności<br>(więcej na ten temat przeczytasz w sekcji „Działania analityczne" Polityki prywatności)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Na jakiej podstawie?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">umowa o świadczenie usługi wysyłki newslettera (art. 6 ust. 1 lit. b RODO)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">nasz prawnie uzasadniony interes, polegający na przetwarzaniu danych w podanym wyżej celu (art. 6 ust. 1 lit. f RODO)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Jak długo?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do momentu, w którym wypiszesz się z naszego newslettera</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">do momentu, w którym uwzględnimy Twój sprzeciw wobec przetwarzania</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">ponadto, Twoje dane będą przetwarzane do upływu okresu, w którym możliwe jest dochodzenie roszczeń – przez Ciebie lub przez nas<br>(więcej informacji na ten temat znajdziesz w ostatniej tabeli tej sekcji)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">nie będziesz mieć możliwości otrzymywania informacji dotyczących Serwisu i naszych usług</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">7. Podjęcie działania lub zaniechanie mogące powodować powstanie roszczeń związanych z Serwisem lub naszymi usługami</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">W jakim celu?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ustalenie, dochodzenie lub obrona ewentualnych roszczeń, związanych z zawartą umową lub świadczonymi usługami</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Na jakiej podstawie?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nasz prawnie uzasadniony interes, polegający na przetwarzaniu danych osobowych we wskazanym powyżej celu (art. 6 ust. 1 lit. f RODO)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Jak długo?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">do upływu okresu przedawnienia roszczeń lub do momentu, w którym uwzględnimy Twój sprzeciw wobec przetwarzania*</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Co się stanie, jeśli nie podasz danych?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">brak możliwości ustalenia, dochodzenia lub obrony roszczeń</td></tr>
    </table>
    * w zależności od tego, które ma zastosowanie w danym przypadku<br><br>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">DZIAŁANIA ANALITYCZNE</h2>
    <p>W ramach strony internetowej Serwisu prowadzimy działania analityczne, mające na celu zwiększenie jej intuicyjności i przystępności – w odniesieniu do Ciebie będzie to miało miejsce, jeśli zezwolisz na takie działania. W ramach analizy będziemy brać pod uwagę sposób, w jaki poruszasz się po Serwisie – a więc np. to, ile czasu spędzasz na danej podstronie, czy w które miejsca w Serwisie klikasz. Dzięki temu podczas prac nad rozwojem Serwisu będziemy mogli zoptymalizować jego układ, wygląd oraz zamieszczane w nim treści, tak aby polepszyć jego funkcjonalność.</p>
    <p>Ponadto, jeśli wyrazisz wolę otrzymywania od nas wiadomości marketingowych lub newslettera, możemy dokonywać analizy efektywności przeprowadzonej przez nas wysyłki. Takie działania pomogą nam ustalić ogólne zasady dotyczące wysyłki tego typu wiadomości w naszej działalności — np. w zakresie optymalnych godzin wysyłki czy sposobu formułowania skutecznych treści.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">BEZPIECZEŃSTWO DANYCH</h2>
    <p>Przetwarzając Twoje dane osobowe stosujemy środki organizacyjne i techniczne zgodne z właściwymi przepisami prawa, w tym stosujemy szyfrowanie połączenia za pomocą certyfikatu SSL/TLS.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">PLIKI COOKIES</h2>
    <p>Nasz Serwis, jak większość witryn internetowych, korzysta z tzw. plików cookies (ciasteczek). Pliki te:</p>
    <ul>
      <li>są zapisywane w pamięci Twojego urządzenia (komputera, telefonu, itd.);</li>
      <li>nie powodują zmian w ustawieniach Twojego urządzenia.</li>
    </ul>
    <p>W tym Serwisie ciasteczka wykorzystywane są w celach:</p>
    <ul>
      <li>zapamiętywania Twojej sesji,</li>
      <li>statystycznych,</li>
      <li>marketingowych.</li>
    </ul>
    <p>Aby dowiedzieć się, jak zarządzać plikami cookies, w tym jak wyłączyć ich obsługę w Twojej przeglądarce, możesz skorzystać z pliku pomocy Twojej przeglądarki (klawisz F1). Odpowiednie wskazówki znajdziesz też tutaj:</p>
    <ul>
      <li><a href="https://support.google.com/chrome/answer/95647?hl=pl" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
      <li><a href="https://help.opera.com/pl/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">Opera</a></li>
      <li><a href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
      <li><a href="https://support.mozilla.org/pl/kb/elementy-sledzace-zewnetrznych-witryn" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
      <li><a href="https://support.microsoft.com/pl-pl/help/4468242/microsoft-edge-browsing-data-and-privacy" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
    </ul>
    <p>Poniżej znajdziesz informacje na temat funkcji przetwarzanych przez nas plików cookie oraz ich okresu ważności.</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nazwa pliku cookie</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">okres ważności pliku cookie</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">funkcja pliku cookie</th>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">bb_theme</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">trwały (localStorage)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">zapamiętanie wybranego motywu kolorystycznego (jasny/ciemny)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">sb-* (Supabase)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">czas trwania sesji / 1 rok</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">utrzymanie sesji zalogowanego użytkownika (uwierzytelnienie)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">presora_cookies</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">czas trwania sesji</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">śledzenie aktywności użytkownika w Serwisie</td>
      </tr>
    </table>
    <br>
    <p>Korzystając z odpowiednich opcji Twojej przeglądarki, w każdej chwili możesz:</p>
    <ul>
      <li>usunąć pliki cookies,</li>
      <li>blokować wykorzystanie plików cookies w przyszłości.</li>
    </ul>
    <p>W takich przypadkach nie będziemy ich już dłużej przetwarzać.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">USŁUGI ZEWNĘTRZNE / ODBIORCY DANYCH</h2>
    <p>Korzystamy z usług podmiotów zewnętrznych, które wspierają nas w prowadzeniu działalności. Powierzamy im do przetwarzania Twoje dane – podmioty te przetwarzają dane wyłącznie na nasze udokumentowane polecenie.</p>
    <p>Poniżej znajdziesz listę odbiorców Twoich danych:</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">DZIAŁANIE</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ODBIORCY DANYCH</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">PRZEKAZANIE DANYCH POZA UNIĘ EUROPEJSKĄ</th>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" rowspan="1">każde działanie w związku z Serwisem</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Brak</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">przebywanie na stronie Serwisu z ustawieniami zezwalającymi na prowadzenie działań marketingowych</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">podmiot zapewniający usługi marketingowe</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">przebywanie na stronie Serwisu z ustawieniami zezwalającymi na prowadzenie działań analitycznych</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">podmiot umożliwiający działania analityczne na stronie</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" rowspan="3">skorzystanie z płatnych usług dostępnych w Serwisie</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">dostawca oprogramowania ułatwiającego prowadzenie działalności (np. oprogramowanie księgowe)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">dostawca płatności (Stripe)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">dostawca standardowego oprogramowania biurowego (w tym skrzynki poczty elektronicznej)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">skorzystanie z bezpłatnych usług dostępnych w Serwisie</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">dostawca standardowego oprogramowania biurowego (w tym skrzynki poczty elektronicznej)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nawiązanie z nami kontaktu (np. zadanie pytania)</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">dostawca standardowego oprogramowania biurowego (w tym skrzynki poczty elektronicznej)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">nie ma miejsca</td>
      </tr>
    </table>
    <br>
    <p>A ponadto: odpowiednie organy publiczne w zakresie, w jakim jesteśmy zobowiązani do udostępnienia im danych.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">PODWYKONAWCY PRZETWARZANIA (SUBPROCESORZY)</h2>
    <p>Konkretni dostawcy, z których korzystamy do świadczenia usługi, wraz z celem przetwarzania. Analiza marki (nazwa marki, wprowadzony przez Ciebie kontekst) jest przekazywana dostawcom modeli AI wyłącznie w celu wygenerowania wyniku analizy — nie jest wykorzystywana do trenowania ich modeli.</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">DOSTAWCA</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">CEL PRZETWARZANIA</th>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Supabase</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">baza danych, uwierzytelnianie, przechowywanie plików</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Netlify</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">hosting aplikacji i funkcji serwerowych</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Anthropic (Claude)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generowanie analizy widoczności marki, asystent czatu</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Voyage AI</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generowanie embeddingów dla wyszukiwania kontekstu marki (RAG)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ElevenLabs</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generowanie głosowego odczytu raportów (opcjonalne)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Stripe</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">obsługa płatności i subskrypcji</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Resend</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">wysyłka wiadomości transakcyjnych (potwierdzenia, resety hasła)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Mailchimp</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">wysyłka newslettera (tylko po dobrowolnym zapisie)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Google (OAuth)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">logowanie za pomocą konta Google (opcjonalne)</td>
      </tr>
    </table>
    <p style="margin-top:1em;">Pełną, aktualną listę oraz warunki przetwarzania danych (DPA) możesz otrzymać, pisząc na <a href="mailto:contact.presora@gmail.com" style="color:#6366F1;">contact.presora@gmail.com</a>.</p>
  </section>

</div>
`;

const EN_HTML = `
${STYLE_BLOCK}
<div class="legal-doc" style="font-family: sans-serif; font-size: 13pt; line-height: 1.7; color: #F8FAFC;">

  <section style="margin-bottom: 2em; text-align: center; border: 1px solid #f59e0b40; background: #f59e0b14; border-radius: 8px; padding: 0.75em 1em;">
    <small>
      ⚠️ Unofficial machine-assisted translation, provided for convenience only. The
      <strong>Polish version is the sole legally binding text</strong> of this Privacy Policy; in case
      of any discrepancy, the Polish version prevails.
    </small>
  </section>

  <section style="margin-bottom: 2em; text-align: center;">
    <small>
      Privacy Policy dated 18.06.2026.<br>
      License number issued by Kreator Legal Geek: <a href="https://kreator.legalgeek.pl/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">f6f61186-8cc8-4ba2-b721-8d31432e3f71</a>.
    </small>
  </section>

  <h1 style="text-align:center; font-size:1.5em; margin-bottom:0.5em;">
    Privacy Policy of the Presora PL Service<br>
    <a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">www.presora.app</a><br>
    ("Service")
  </h1>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">Dear User!</h2>
    <p>We care about your privacy and want you to feel comfortable while using our services. That's why below we present the most important information about the rules for our processing of your personal data and the cookies used by our Service. This information has been prepared in accordance with the <strong>GDPR</strong>, i.e. Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (the <strong>General Data Protection Regulation</strong>).</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">DATA CONTROLLER</h2>
    <p>Patryk Rybacki<br>unregistered (sole trader) business activity<br>Biskupia 7/2</p>
    <p>If you would like to contact us regarding our processing of your personal data, please write to us at: <strong>contact.presora@gmail.com</strong>.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">YOUR RIGHTS</h2>
    <p>You have the right to request:</p>
    <ul>
      <li>access to your personal data, including obtaining a copy of your data (Art. 15 GDPR, or — where applicable — Art. 13(1)(f) GDPR),</li>
      <li>its rectification (Art. 16 GDPR),</li>
      <li>its erasure (Art. 17 GDPR),</li>
      <li>restriction of processing (Art. 18 GDPR),</li>
      <li>transfer of data to another controller (Art. 20 GDPR).</li>
    </ul>
    <p>You also have the right:</p>
    <ul>
      <li>to object at any time to the processing of your data:
        <ul>
          <li>on grounds relating to your particular situation — to processing of your personal data based on Art. 6(1)(f) GDPR (i.e. based on our legitimate interests) (Art. 21(1) GDPR);</li>
          <li>where personal data is processed for direct-marketing purposes, to the extent the processing is related to such direct marketing (Art. 21(2) GDPR).</li>
        </ul>
      </li>
    </ul>
    <p>Contact us if you wish to exercise your rights. You can object to our use of cookies in particular via the relevant settings in your browser.</p>
    <p>If you believe your data is being processed unlawfully, you may lodge a complaint with the President of the Personal Data Protection Office (Poland's supervisory authority).</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">PERSONAL DATA AND PRIVACY</h2>
    <p>Below you will find detailed information on the processing of your data depending on the actions you take.</p>

    <h3 style="font-size:1em; margin-top:1.2em;">1. Using the free services offered in the Service</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For what purpose?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">performance of the contract for services offered in the Service</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">On what basis?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">contract for the provision of services (Art. 6(1)(b) GDPR)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For how long?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">for the duration of the contract</td></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">additionally, your data will be processed until the expiry of the period during which claims can be pursued — by you or by us<br>(see the last table of this section for more details)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">you won't be able to use our services</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">2. Using the paid services offered in the Service</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For what purpose?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">performance of the contract for services offered in the Service</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">On what basis?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">contract for the provision of services (Art. 6(1)(b) GDPR)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">a legal obligation, in particular related to accounting, requiring us to process your personal data (Art. 6(1)(c) GDPR)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For how long?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">for the duration of the contract</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until our legal obligations expire</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">additionally, your data will be processed until the expiry of the period during which claims can be pursued — by you or by us<br>(see the last table of this section for more details)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">you won't be able to use our services</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">3. Contacting us (e.g. to ask a question)</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For what purpose?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">handling your inquiries or requests</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">On what basis?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">a contract, or actions taken at your request aimed at concluding one (Art. 6(1)(b) GDPR) — where your inquiry or request relates to a contract to which we are or may become a party</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">our legitimate interest in processing your data in order to communicate with you (Art. 6(1)(f) GDPR) — if your inquiry or request is unrelated to any contract</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For how long?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">for the duration of any binding contract, or — if no contract is concluded — until the expiry of the period for pursuing claims — see the last table of this section*</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until the expiry of the period for pursuing claims — see the last table of this section — or until we have taken your objection to processing into account*</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">additionally, your data will be processed until the expiry of the period during which claims can be pursued — by you or by us<br>(see the last table of this section for more details)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">we won't be able to respond to your inquiry or request</td></tr>
    </table>
    * depending on which applies in a given case<br><br>

    <h3 style="font-size:1em; margin-top:1.2em;">4. Browser settings or similar action allowing analytics</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For what purpose?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">analyzing how you use and navigate the Service's website, in order to improve its functionality<br>(see the "Analytics" and "Cookies" sections of the Privacy Policy for more)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">On what basis?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">our legitimate interest in processing data for the above purpose (Art. 6(1)(f) GDPR)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For how long?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">until the expiry or your deletion of the cookies used for analytics purposes*</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">we won't take your usage and navigation patterns on the Service's website into account in developing it further</td></tr>
    </table>
    * depending on which applies in a given case<br><br>

    <h3 style="font-size:1em; margin-top:1.2em;">5. Giving your consent to receive marketing content from us</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For what purpose?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">sending marketing information, in particular special offers</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">analyzing the effectiveness of the messages we send, in order to establish general rules for effective messaging in our business<br>(see the "Analytics" section of the Privacy Policy for more)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">On what basis?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">your consent to our marketing activities (Art. 6(1)(a) GDPR)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">our legitimate interest in processing data for the above purpose (Art. 6(1)(f) GDPR)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For how long?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until you withdraw your consent — remember, you can withdraw your consent at any time. Processing carried out until you withdraw consent remains lawful.</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until we have taken your objection to processing into account</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">additionally, your data will be processed until the expiry of the period during which claims can be pursued — by you or by us<br>(see the last table of this section for more details)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">you won't receive our marketing materials, including information about our special offers</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">6. Subscribing to the newsletter</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For what purpose?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">sending the newsletter</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">analyzing the effectiveness of the content we send, in order to establish general rules for effective messaging in our business<br>(see the "Analytics" section of the Privacy Policy for more)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">On what basis?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">contract for the provision of the newsletter service (Art. 6(1)(b) GDPR)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">our legitimate interest in processing data for the above purpose (Art. 6(1)(f) GDPR)</td>
      </tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">For how long?</th></tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until you unsubscribe from our newsletter</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;width:50%;">until we have taken your objection to processing into account</td>
      </tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">additionally, your data will be processed until the expiry of the period during which claims can be pursued — by you or by us<br>(see the last table of this section for more details)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;" colspan="2">you won't be able to receive information about the Service and our offerings</td></tr>
    </table>
    <br>

    <h3 style="font-size:1em; margin-top:1.2em;">7. Taking or refraining from action that may give rise to claims related to the Service or our services</h3>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For what purpose?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">establishing, pursuing, or defending against any claims related to the contract concluded or services provided</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">On what basis?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">our legitimate interest in processing personal data for the purpose indicated above (Art. 6(1)(f) GDPR)</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">For how long?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">until the statute of limitations for claims expires, or until we have taken your objection to processing into account*</td></tr>
      <tr><th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">What happens if you don't provide your data?</th></tr>
      <tr><td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">we would be unable to establish, pursue, or defend claims</td></tr>
    </table>
    * depending on which applies in a given case<br><br>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">ANALYTICS</h2>
    <p>Within the Service's website, we carry out analytics activities aimed at increasing its intuitiveness and accessibility — as far as you are concerned, this will only take place if you allow such activities. As part of the analysis, we take into account how you navigate the Service — e.g. how much time you spend on a given subpage, or which parts of the Service you click on. This helps us optimize the Service's layout, appearance, and content during its development, in order to improve its functionality.</p>
    <p>Additionally, if you agree to receive marketing messages or the newsletter from us, we may analyze the effectiveness of the messages we've sent. Such activities help us establish general rules for sending this type of message in our business — e.g. regarding the optimal sending times or how to formulate effective content.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">DATA SECURITY</h2>
    <p>When processing your personal data, we apply organizational and technical measures compliant with the relevant legal provisions, including encrypting the connection using an SSL/TLS certificate.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">COOKIES</h2>
    <p>Our Service, like most websites, uses so-called cookies. These files:</p>
    <ul>
      <li>are stored in the memory of your device (computer, phone, etc.);</li>
      <li>do not cause changes to your device's settings.</li>
    </ul>
    <p>In this Service, cookies are used for:</p>
    <ul>
      <li>remembering your session,</li>
      <li>statistical purposes,</li>
      <li>marketing purposes.</li>
    </ul>
    <p>To learn how to manage cookies, including how to disable them in your browser, you can use your browser's help file (F1 key). You can also find helpful guidance here:</p>
    <ul>
      <li><a href="https://support.google.com/chrome/answer/95647?hl=en" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
      <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">Opera</a></li>
      <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
      <li><a href="https://support.microsoft.com/en-us/help/4468242/microsoft-edge-browsing-data-and-privacy" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
    </ul>
    <p>Below you'll find information on the function of the cookies we process and their validity period.</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">cookie name</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">cookie validity period</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">cookie function</th>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">bb_theme</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">persistent (localStorage)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">remembering your chosen color theme (light/dark)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">sb-* (Supabase)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">session duration / 1 year</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">maintaining a logged-in user's session (authentication)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">presora_cookies</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">session duration</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">tracking user activity within the Service</td>
      </tr>
    </table>
    <br>
    <p>Using the relevant options in your browser, you can at any time:</p>
    <ul>
      <li>delete cookies,</li>
      <li>block the use of cookies in the future.</li>
    </ul>
    <p>In such cases, we will no longer process them.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">EXTERNAL SERVICES / DATA RECIPIENTS</h2>
    <p>We use the services of external entities that support us in running our business. We entrust them with the processing of your data — these entities process data only on our documented instructions.</p>
    <p>Below you will find a list of recipients of your data:</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ACTION</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">DATA RECIPIENTS</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">TRANSFER OF DATA OUTSIDE THE EUROPEAN UNION</th>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" rowspan="1">any action related to the Service</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">None</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">browsing the Service's website with settings allowing marketing activities</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a marketing services provider</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">browsing the Service's website with settings allowing analytics</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">an entity enabling analytics on the site</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;" rowspan="3">using the paid services available in the Service</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a provider of business-support software (e.g. accounting software)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a payment provider (Stripe)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a provider of standard office software (including e-mail)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">using the free services available in the Service</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a provider of standard office software (including e-mail)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">contacting us (e.g. asking a question)</th>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">a provider of standard office software (including e-mail)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">not applicable</td>
      </tr>
    </table>
    <br>
    <p>Additionally: relevant public authorities, to the extent we are legally obliged to make data available to them.</p>
  </section>

  <section style="margin-bottom:2em;">
    <h2 style="font-size:1.1em; margin-top:1.5em;">SUBPROCESSORS</h2>
    <p>The specific providers we use to deliver the service, together with the purpose of processing. Brand analysis (brand name, context you provided) is shared with AI model providers solely to generate the analysis result — it is not used to train their models.</p>
    <table style="width:100%;margin-top:1em;max-width:75em;border-collapse:collapse;">
      <tr>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">PROVIDER</th>
        <th style="color:#F8FAFC;background-color:#1E293B;text-align:center;border:1px solid #334155;padding:0.5em 1em;">PURPOSE OF PROCESSING</th>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Supabase</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">database, authentication, file storage</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Netlify</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">application and serverless-function hosting</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Anthropic (Claude)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generating the brand-visibility analysis, chat assistant</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Voyage AI</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generating embeddings for brand-context retrieval (RAG)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">ElevenLabs</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">generating a spoken read-out of reports (optional)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Stripe</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">payment and subscription processing</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Resend</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">sending transactional messages (confirmations, password resets)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Mailchimp</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">sending the newsletter (only after voluntary sign-up)</td>
      </tr>
      <tr>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">Google (OAuth)</td>
        <td style="color:#F8FAFC;background-color:#111827;text-align:center;border:1px solid #334155;padding:0.5em 1em;">signing in with a Google account (optional)</td>
      </tr>
    </table>
    <p style="margin-top:1em;">You can request the full, current list, along with the data processing terms (DPA), by writing to <a href="mailto:contact.presora@gmail.com" style="color:#6366F1;">contact.presora@gmail.com</a>.</p>
  </section>

</div>
`;

const Privacy = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'pl' | 'en'>('pl');

  // Keeps screen readers / browser tooling in sync with whichever legal
  // text is actually on screen — useSeo.ts sets 'pl' on route entry (see
  // seo-config.json's per-page lang), but this in-page toggle changes the
  // visible content without a navigation, so it has to update the
  // document's lang itself. Reset back to 'pl' on unmount so leaving this
  // page never strands the next page on 'en'.
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

export default Privacy;
