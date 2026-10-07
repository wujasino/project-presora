import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const NewsletterTerms = () => {
  const navigate = useNavigate();
  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Powrót
      </button>
      <div
        dangerouslySetInnerHTML={{
          __html: `
<div style="font-family: sans-serif; font-size: 13pt; line-height: 1.8; color: #000; background: #fff; padding: 2em; border-radius: 12px;">

  <h1 style="text-align:center; font-size:1.5em; margin-bottom:0.25em;">Regulamin Newslettera</h1>
  <p style="text-align:center; margin-top:0; margin-bottom:1.5em;">w serwisie Presora PL</p>

  <p><b>SPIS TREŚCI</b><br>
    <b>§ 1</b> Definicje<br>
    <b>§ 2</b> Kontakt z Usługodawcą<br>
    <b>§ 3</b> Wymogi techniczne<br>
    <b>§ 4</b> Umowa<br>
    <b>§ 5</b> Reklamacje<br>
    <b>§ 6</b> Prawo odstąpienia od Umowy<br>
    <b>§ 7</b> Dane osobowe<br>
    <b>§ 8</b> Zmiana w Regulaminie lub Newsletterze<br>
    <b>§ 9</b> Postanowienia końcowe
  </p>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 1 DEFINICJE</h2>
  <div style="margin-bottom:1em;">
    <strong>Konsument</strong> – Usługobiorca będący osobą fizyczną, który zawarł Umowę lub podejmuje czynności zmierzające do jej zawarcia, bez bezpośredniego związku z jego działalnością gospodarczą lub zawodową.<br>
    <strong>Newsletter</strong> – wiadomości dotyczące Serwisu, w tym informacje o ofertach, promocjach oraz nowościach, dostarczane nieodpłatnie Usługobiorcy przez Usługodawcę w ramach Umowy, stanowiące treści cyfrowe w rozumieniu Ustawy o prawach konsumenta.<br>
    <strong>Przedsiębiorca uprzywilejowany</strong> – Usługobiorca, który jest osobą fizyczną zawierającą Umowę (lub podejmującą czynności zmierzające do jej zawarcia), bezpośrednio związaną z jej działalnością gospodarczą, ale nieposiadającą dla niej charakteru zawodowego.<br>
    <strong>Regulamin</strong> – niniejszy regulamin.<br>
    <strong>Serwis</strong> – serwis internetowy Presora PL prowadzony przez Usługodawcę pod adresem <a href="https://www.presora.app" target="_blank" rel="noopener noreferrer">www.presora.app</a>.<br>
    <strong>Umowa</strong> – umowa o dostarczanie Newslettera.<br>
    <strong>Usługobiorca</strong> – każdy podmiot, który zawarł Umowę lub podejmuje czynności zmierzające do jej zawarcia.<br>
    <strong>Usługobiorca uprzywilejowany</strong> – Usługobiorca, który jest Konsumentem lub Przedsiębiorcą uprzywilejowanym.<br>
    <strong>Usługodawca</strong> – Patryk Rybacki, działalność nierejestrowana, Biskupia 7/2.<br>
    <strong>Ustawa o prawach konsumenta</strong> – polska ustawa z dnia 30 maja 2014 r. o prawach konsumenta.
  </div>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 2 KONTAKT Z USŁUGODAWCĄ</h2>
  <ol style="margin-bottom:1em;">
    <li>Adres pocztowy: Biskupia 7/2</li>
    <li>Adres e-mail: <strong>contact.presora@gmail.com</strong></li>
    <li>Telefon: 733 555 642</li>
    <li>Koszt połączenia telefonicznego lub transmisji danych wykonywanych przez Usługobiorcę wynika z podstawowej taryfy operatora telekomunikacyjnego lub dostawcy usług internetowych, z którego usług korzysta Usługobiorca.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 3 WYMOGI TECHNICZNE</h2>
  <ol style="margin-bottom:1em;">
    <li>Dla skorzystania z treści cyfrowych objętych Regulaminem potrzebne jest:
      <ul>
        <li>aktywne konto e-mail;</li>
        <li>urządzenie z dostępem do Internetu;</li>
        <li>przeglądarka internetowa obsługująca JavaScript i pliki cookies.</li>
      </ul>
    </li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 4 UMOWA</h2>
  <ol style="margin-bottom:1em;">
    <li>Usługobiorca może dobrowolnie zapisać się do Newslettera.</li>
    <li>W celu otrzymania Newslettera konieczne jest zawarcie Umowy.</li>
    <li>Wiadomości e-mail wysyłane w ramach Umowy kierowane będą na adres e-mail podany przez Usługobiorcę w momencie zawierania Umowy.</li>
    <li>Usługobiorca, w celu zawarcia Umowy, podaje w przeznaczonym do tego miejscu w Serwisie swój adres e-mail. W momencie zapisu na Newsletter zostaje zawarta Umowa na czas nieoznaczony, a Usługodawca rozpocznie jej świadczenie na rzecz Usługobiorcy.</li>
    <li>W celu właściwej realizacji Umowy Usługobiorca jest obowiązany podać swój prawidłowy adres e-mail.</li>
    <li>Newsletter jest dostarczany niezwłocznie po utworzeniu przez Usługodawcę wiadomości przeznaczonych dla Usługobiorców.</li>
    <li>W wiadomościach wysyłanych w ramach Newslettera będzie znajdować się informacja o możliwości wypisania się z niego, a także link do wypisania się.</li>
    <li>Usługobiorca może wypisać się z Newslettera bez podawania przyczyny i ponoszenia jakichkolwiek kosztów, w każdym momencie, korzystając z opcji, o której mowa w poprzednim postanowieniu, lub wysyłając wiadomość na adres e-mail Usługodawcy podany w § 2 Regulaminu.</li>
    <li>Skorzystanie przez Usługobiorcę z linka do wypisania się z Newslettera lub wysłanie wiadomości z żądaniem wypisania z Newslettera będzie skutkować niezwłocznym rozwiązaniem Umowy.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 5 REKLAMACJE</h2>

  <h3 style="font-size:1em; margin-top:1.2em;">I. Postanowienia ogólne</h3>
  <ol style="margin-bottom:1em;">
    <li>Usługodawca prosi o składanie reklamacji dotyczących treści cyfrowych objętych Regulaminem na adres pocztowy lub elektroniczny wskazany w § 2 Regulaminu.</li>
    <li>Usługodawca ustosunkuje się do reklamacji w terminie 14 dni od otrzymania zgłoszenia reklamacyjnego.</li>
  </ol>

  <h3 style="font-size:1em; margin-top:1.2em;">II. Usługobiorcy uprzywilejowani</h3>
  <ol start="3" style="margin-bottom:1em;">
    <li>Usługodawca ponosi wobec Usługobiorcy uprzywilejowanego odpowiedzialność za zgodność świadczenia z Umową, przewidzianą przez powszechnie obowiązujące przepisy prawa, w tym zwłaszcza przez przepisy Ustawy o prawach konsumenta.</li>
    <li>W przypadku niewłaściwej realizacji przez Usługodawcę Umowy, Usługobiorca uprzywilejowany ma możliwość skorzystania z uprawnień uregulowanych w rozdziale 5b Ustawy o prawach konsumenta.</li>
    <li>Jeżeli Usługodawca nie dostarczył treści cyfrowych objętych Umową, Usługobiorca uprzywilejowany może wezwać go do ich dostarczenia. Jeżeli mimo to Usługodawca nie dostarczy treści cyfrowych niezwłocznie lub w dodatkowym, wyraźnie uzgodnionym terminie, Usługobiorca uprzywilejowany może odstąpić od Umowy.</li>
    <li>Usługobiorca uprzywilejowany może odstąpić od Umowy bez wzywania do dostarczenia treści cyfrowych, jeżeli:
      <ul>
        <li>z oświadczenia Usługodawcy lub okoliczności wyraźnie wynika, że nie dostarczy treści cyfrowych objętych Umową, lub</li>
        <li>Usługobiorca uprzywilejowany i Usługodawca uzgodnili lub z okoliczności zawarcia Umowy wyraźnie wynika, że określony termin dostarczenia miał istotne znaczenie, a Usługodawca nie dostarczył ich w tym terminie.</li>
      </ul>
    </li>
    <li>Usługodawca ponosi odpowiedzialność za brak zgodności Newslettera z Umową, który wystąpił lub ujawnił się w czasie, w którym zgodnie z tą Umową miał być dostarczany.</li>
    <li>Jeżeli treści cyfrowe objęte Regulaminem są niezgodne z Umową, Usługobiorca uprzywilejowany może żądać doprowadzenia do ich zgodności z Umową.</li>
    <li>W przypadku braku zgodności z Umową, Usługobiorca uprzywilejowany ma obowiązek współpracy z Usługodawcą, w rozsądnym zakresie i przy zastosowaniu najmniej uciążliwych dla siebie środków technicznych, w celu ustalenia, czy brak zgodności wynika z cech środowiska cyfrowego Usługobiorcy uprzywilejowanego.</li>
    <li>Dodatkowo, jeżeli treści cyfrowe objęte Regulaminem są niezgodne z Umową, Usługobiorca uprzywilejowany może złożyć oświadczenie o odstąpieniu od Umowy, gdy:
      <ul>
        <li>doprowadzenie do zgodności jest niemożliwe albo wymaga nadmiernych kosztów stosownie do art. 43m ust. 2 i 3 Ustawy o prawach konsumenta;</li>
        <li>Usługodawca nie doprowadził treści cyfrowych do zgodności z Umową w rozsądnym czasie i bez nadmiernych niedogodności dla Usługobiorcy uprzywilejowanego;</li>
        <li>brak zgodności z Umową treści cyfrowych objętych Regulaminem występuje nadal, mimo że Usługodawca próbował doprowadzić je do zgodności z Umową;</li>
        <li>brak zgodności z Umową jest na tyle istotny, że uzasadnia odstąpienie od Umowy bez uprzedniego skorzystania ze środka ochrony określonego w art. 43m Ustawy o prawach konsumenta;</li>
        <li>z oświadczenia Usługodawcy lub okoliczności wyraźnie wynika, że nie doprowadzi on do zgodności z Umową w rozsądnym czasie lub bez nadmiernych niedogodności dla Usługobiorcy uprzywilejowanego.</li>
      </ul>
    </li>
  </ol>

  <h3 style="font-size:1em; margin-top:1.2em;">III. Pozasądowe sposoby rozpatrywania reklamacji i dochodzenia roszczeń</h3>
  <ol start="11" style="margin-bottom:1em;">
    <li>Usługodawca informuje Konsumenta o możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń.<br><br>
      Konsument może skorzystać m.in. z pomocy odpowiedniego Europejskiego Centrum Konsumenckiego z Sieci Europejskich Centrów Konsumenckich. Lista Centrów: <a href="https://konsument.gov.pl/eck-w-europie/" target="_blank" rel="noopener noreferrer">https://konsument.gov.pl/eck-w-europie/</a><br><br>
      Ponadto, na terenie Rzeczypospolitej Polskiej można skorzystać z:
      <ul>
        <li>mediacji prowadzonej przez właściwy terenowo Wojewódzki Inspektorat Inspekcji Handlowej: <a href="https://uokik.gov.pl/kontakt-inspekcja-handlowa" target="_blank" rel="noopener noreferrer">https://uokik.gov.pl/kontakt-inspekcja-handlowa</a></li>
        <li>pomocy właściwego terenowo stałego polubownego sądu konsumenckiego działającego przy Wojewódzkim Inspektoracie Inspekcji Handlowej.</li>
      </ul>
    </li>
    <li>Poprzednie postanowienie ma charakter informacyjny i nie stanowi zobowiązania Usługodawcy do skorzystania z pozasądowych sposobów rozwiązywania sporów.</li>
    <li>Skorzystanie z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń jest dobrowolne zarówno dla Usługodawcy, jak i Konsumenta.</li>
    <li>Konsument może dodatkowo skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 6 PRAWO ODSTĄPIENIA OD UMOWY</h2>
  <ol style="margin-bottom:1em;">
    <li>Usługobiorca uprzywilejowany ma prawo odstąpić od zawartej z Usługodawcą Umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny.</li>
    <li>Termin do odstąpienia od Umowy wygasa po upływie 14 dni od dnia zawarcia tej Umowy.</li>
    <li>Aby Usługobiorca uprzywilejowany mógł skorzystać z prawa odstąpienia od Umowy, musi poinformować Usługodawcę o swojej decyzji o odstąpieniu w drodze jednoznacznego oświadczenia (na przykład pismo wysłane pocztą lub pocztą elektroniczną). W tym celu Usługobiorca uprzywilejowany może skorzystać z danych Usługodawcy podanych w § 2 Regulaminu albo użyć funkcji odstąpienia od umowy, o której mowa w ust. 4.</li>
    <li>Usługobiorca uprzywilejowany może wykonać prawo odstąpienia od umowy zawartej przez internet za pomocą funkcji odstąpienia od umowy, dostępnej na stronie internetowej <a href="https://www.presora.app/settings" target="_blank" rel="noopener noreferrer">https://www.presora.app/settings</a> (zakładka Rozliczenia). W przypadku skorzystania z tej funkcji, Usługodawca bez zbędnej zwłoki prześle Usługobiorcy uprzywilejowanemu potwierdzenie otrzymania informacji o odstąpieniu od umowy na trwałym nośniku (pocztą elektroniczną), w tym jego treść oraz datę i godzinę złożenia.</li>
    <li>Usługobiorca uprzywilejowany może skorzystać z wzoru formularza odstąpienia od Umowy umieszczonego na końcu Regulaminu, jednak nie jest to obowiązkowe.</li>
    <li>Aby zachować termin do odstąpienia od Umowy wystarczy, że Usługobiorca uprzywilejowany wyśle informację dotyczącą wykonania przysługującego mu prawa odstąpienia od Umowy przed upływem terminu do odstąpienia od Umowy.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 7 DANE OSOBOWE</h2>
  <ol style="margin-bottom:1em;">
    <li>Administratorem danych osobowych przekazanych przez Usługobiorcę w związku z Umową jest Usługodawca. Szczegółowe informacje dotyczące przetwarzania danych osobowych – w tym o pozostałych celach oraz podstawach przetwarzania danych, a także o odbiorcach danych, znajdują się w dostępnej w Serwisie <a href="https://www.presora.app/polityka-prywatnosci" target="_blank" rel="noopener noreferrer">polityce prywatności</a>.</li>
    <li>Celem przetwarzania danych Usługobiorcy jest:
      <ul>
        <li>realizacja Umowy; podstawą przetwarzania danych osobowych w tym przypadku jest Umowa lub działania podejmowane na żądanie Usługobiorcy, zmierzające do jej zawarcia (art. 6 ust. 1 lit. b RODO);</li>
        <li>analiza efektywności wysłanych w ramach Umowy wiadomości, celem ustalenia ogólnych zasad dotyczących skutecznej wysyłki w działalności Usługodawcy; podstawą przetwarzania danych osobowych w tym celu jest prawnie uzasadniony interes Usługodawcy (art. 6 ust. 1 lit. f RODO);</li>
        <li>ustalenie, dochodzenie lub obrona ewentualnych roszczeń związanych z Umową; podstawą przetwarzania danych osobowych w tym celu jest prawnie uzasadniony interes Usługodawcy (art. 6 ust. 1 lit. f RODO).</li>
      </ul>
    </li>
    <li>Podanie danych przez Usługobiorcę jest dobrowolne, ale jednocześnie konieczne do zawarcia Umowy i dostarczenia objętych nią treści cyfrowych. Niepodanie danych spowoduje, że Umowa nie będzie mogła być zawarta.</li>
    <li>Dane Usługobiorcy będą przetwarzane do momentu, w którym:
      <ol type="a">
        <li>przestanie obowiązywać Umowa;</li>
        <li>ustanie możliwość dochodzenia roszczeń przez Usługobiorcę lub Usługodawcę, związanych z Umową;</li>
        <li>zostanie przyjęty sprzeciw Usługobiorcy wobec przetwarzania jego danych osobowych – w przypadku gdy podstawą przetwarzania danych był uzasadniony interes Usługodawcy</li>
      </ol>
      – w zależności od tego, co ma zastosowanie w danym przypadku.
    </li>
    <li>Usługobiorcy przysługuje prawo żądania:
      <ol type="a">
        <li>dostępu do swoich danych osobowych,</li>
        <li>ich sprostowania,</li>
        <li>usunięcia,</li>
        <li>ograniczenia przetwarzania,</li>
        <li>przeniesienia danych do innego administratora,<br>a także prawo:</li>
        <li>wniesienia w dowolnym momencie sprzeciwu wobec przetwarzania danych z przyczyn związanych ze szczególną sytuacją Usługobiorcy – wobec przetwarzania dotyczących go danych osobowych, opartego na art. 6 ust. 1 lit. f RODO.</li>
      </ol>
    </li>
    <li>W celu realizacji swoich praw, Usługobiorca powinien skontaktować się z Usługodawcą.</li>
    <li>W przypadku gdy Usługobiorca uzna, że jego dane są przetwarzane niezgodnie z prawem, Usługobiorca może złożyć skargę do organu właściwego dla ochrony danych osobowych. W Polsce jest nim Prezes Urzędu Ochrony Danych Osobowych.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 8 ZMIANA W REGULAMINIE LUB NEWSLETTERZE</h2>
  <ol style="margin-bottom:1em;">
    <li>Usługodawca zastrzega sobie prawo do zmiany Regulaminu tylko z ważnych przyczyn. Jako ważną przyczynę rozumie się konieczność zmiany Regulaminu spowodowaną:
      <ol type="a">
        <li>zmianą funkcjonalności Newslettera, wymagającą modyfikacji Regulaminu, lub</li>
        <li>zmianą przepisów prawa, mającą wpływ na realizację Umowy przez Usługodawcę lub dostosowaniem usług do zaleceń, wytycznych, nakazów lub zakazów, orzeczeń, postanowień, interpretacji lub decyzji uprawnionych władz publicznych, lub</li>
        <li>zmianą danych kontaktowych lub identyfikacyjnych Usługodawcy.</li>
      </ol>
    </li>
    <li>Informacja o planowanej zmianie Regulaminu zostanie wysłana na adres e-mail Usługobiorcy podany w momencie zawarcia Umowy co najmniej na 7 dni przed wprowadzeniem zmian w życie.</li>
    <li>W przypadku gdy Usługobiorca nie sprzeciwi się planowanym zmianom do chwili wejścia ich w życie, przyjmuje się, że akceptuje je, co nie stanowi żadnej przeszkody do rozwiązania Umowy w przyszłości.</li>
    <li>W przypadku braku akceptacji dla planowanych zmian, Usługobiorca powinien wysłać informację o tym na adres e-mail Usługodawcy podany w § 2 Regulaminu, co będzie skutkować rozwiązaniem Umowy z chwilą wejścia w życie planowanych zmian.</li>
    <li>Usługodawca może dokonać zmiany Newslettera, która nie jest niezbędna do zachowania jego zgodności z Umową, z przyczyny wskazanej w ust. 1 lit. b lub z powodu zmiany funkcjonalności Newslettera. Postanowienia ust. 2–4 stosuje się odpowiednio.</li>
    <li>Jeżeli zmiana, o której mowa w poprzednim postanowieniu, istotnie i negatywnie wpływa na dostęp Usługobiorcy uprzywilejowanego do Newslettera lub korzystanie z niego, Usługodawca wyśle na adres e-mail Usługobiorcy uprzywilejowanego z odpowiednim wyprzedzeniem, na trwałym nośniku, informację o właściwościach i terminie dokonania tej zmiany oraz prawach przysługujących Usługobiorcy uprzywilejowanemu.</li>
  </ol>

  <h2 style="font-size:1.1em; margin-top:1.8em;">§ 9 POSTANOWIENIA KOŃCOWE</h2>
  <ol style="margin-bottom:1em;">
    <li>Zakazane jest dostarczanie przez Usługobiorcę treści o charakterze bezprawnym.</li>
    <li>Umowa zawierana jest w języku polskim.</li>
    <li>Umowa zawierana na podstawie niniejszego Regulaminu podlega przepisom prawa polskiego, z zastrzeżeniem ust. 4.</li>
    <li>Wybór prawa polskiego dla Umowy zawartej na podstawie Regulaminu z Konsumentem nie uchyla i nie ogranicza praw Konsumenta przysługujących mu na podstawie bezwzględnie obowiązujących przepisów prawa, znajdujących zastosowanie dla tego Konsumenta w sytuacji, w której nie ma miejsca wybór prawa.</li>
    <li>W przypadku ewentualnego sporu z Usługobiorcą niebędącym Usługobiorcą uprzywilejowanym, związanego z Umową, sądem właściwym będzie sąd właściwy dla siedziby Usługodawcy.</li>
    <li>Wszelka odpowiedzialność Usługodawcy w związku z Umową w stosunku do Usługobiorcy niebędącego Usługobiorcą uprzywilejowanym, w granicach prawem dopuszczonych, jest wyłączona.</li>
  </ol>

  <div style="margin-top:3em; border-top:1px solid #ccc; padding-top:2em;">
    <h2 style="font-size:1.1em;">Załącznik nr 1 do Regulaminu</h2>
    <p>Poniżej znajduje się wzór formularza odstąpienia od umowy, z którego Konsument lub Przedsiębiorca uprzywilejowany może, ale nie musi skorzystać:</p>

    <p style="text-align:center; margin-top:1.5em;">
      <strong>WZÓR FORMULARZA ODSTĄPIENIA OD UMOWY</strong><br>
      <small>(formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)</small>
    </p>

    <p>
      Patryk Rybacki, działalność nierejestrowana<br>
      Biskupia 7/2<br>
      adres e-mail: contact.presora@gmail.com
    </p>

    <p>
      Ja/My(*) ......................................................................................
      niniejszym informuję/informujemy(*) o moim/naszym odstąpieniu od umowy o świadczenie następującej usługi(*) / o dostarczenie treści cyfrowych w postaci(*):
    </p>
    <p>
      ..............................................................................................................................................................................<br><br>
      ..............................................................................................................................................................................<br><br>
      ..............................................................................................................................................................................
    </p>
    <p>
      Data zawarcia umowy(*):<br><br>
      ..............................................................................................................................................................................<br><br>

      Imię i nazwisko Konsumenta(-ów) / Przedsiębiorcy(-ów) uprzywilejowanego(-ych):<br><br>
      ..............................................................................................................................................................................<br><br>

      Adres Konsumenta(-ów) / Przedsiębiorcy(-ów) uprzywilejowanego(-ych):<br><br>
      ..............................................................................................................................................................................<br><br>
      ..............................................................................................................................................................................
    </p>
    <p style="text-align:right; margin-top:2em;">
      .............................................................................................<br>
      Podpis Konsumenta(-ów) / Przedsiębiorcy(-ów) uprzywilejowanego(-ych)<br>
      <small>(tylko jeżeli formularz jest przesyłany w wersji papierowej)</small><br><br>
      Data ............................................
    </p>
    <p style="text-align:right;"><small>(*) Niepotrzebne skreślić.</small></p>
  </div>

</div>
          `,
        }}
      />
    </div>
    <Footer />
  </div>
  );
};

export default NewsletterTerms;
